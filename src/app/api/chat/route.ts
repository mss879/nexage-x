import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { SYSTEM_PROMPT } from "@/lib/ai-context";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

// Helper to extract potential lead details from conversation history
function extractLeadFromMessages(messages: Array<{ role: string; content: string }>) {
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");

  // Email regex check
  const emailMatch = userMessages.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/);
  if (!emailMatch) return null;

  const email = emailMatch[0];

  // Try to find name / company / phone / budget clues
  let name = "Website Visitor";
  const nameMatch = userMessages.match(/(?:my name is|i am|i'm|this is)\s+([A-Za-z\s]{2,30})/i);
  if (nameMatch && nameMatch[1]) {
    name = nameMatch[1].trim();
  }

  let company: string | undefined;
  const companyMatch = userMessages.match(/(?:company|business|agency|store|brand)\s*(?:is|called|named)?\s*:?\s*([A-Za-z0-9\s.]{2,40})/i);
  if (companyMatch && companyMatch[1]) {
    company = companyMatch[1].trim();
  }

  let budget: string | undefined;
  const budgetMatch = userMessages.match(/(?:\$|AED|USD|budget|range)\s*:?\s*(\d+k?|\d+,\d+|\$\d+-\$\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    budget = budgetMatch[1].trim();
  }

  return {
    name,
    email,
    company,
    budget,
    message: userMessages.slice(-500),
  };
}

export async function POST(req: Request) {
  try {
    const { messages, saveLead } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const formattedMessages = messages.map((msg) => ({
      role: (msg.role === "user" ? "user" : msg.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
      content: typeof msg.content === "string" ? msg.content : "",
    }));

    // Fallback if API key is missing
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Graceful fallback response for local development when OPENAI_API_KEY isn't set yet
      const lastUserMsg = formattedMessages[formattedMessages.length - 1]?.content || "";

      let fallbackText = "Hello! I am YARI's AI Assistant. I can help answer your questions about our software engineering, custom Next.js web applications, Odoo ERP & Zoho CRM integrations, and logistics technology solutions.";

      if (lastUserMsg.toLowerCase().includes("contact") || lastUserMsg.toLowerCase().includes("email") || lastUserMsg.toLowerCase().includes("quote") || lastUserMsg.toLowerCase().includes("project")) {
        fallbackText = "Thanks for your interest in working with YARI! You can reach our engineering team directly at contact@yari.com or call +971 50 863 2422. Please share your project scope, timeline, and email address, and we will get back to you with a proposal.";
      } else if (lastUserMsg.toLowerCase().includes("service")) {
        fallbackText = "YARI specializes in two core disciplines:\n- Software Services: Custom web apps, mobile apps, AI automation, Odoo/Zoho ERP & CRM sync, headless e-commerce.\n- Logistics Technology: Warehouse inventory syncing, automated dispatch, freight tracking, reverse logistics.\n\nWhich area would you like to explore?";
      }

      return NextResponse.json({ content: fallbackText });
    }

    // Call OpenAI via Vercel AI SDK
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: SYSTEM_PROMPT,
      messages: formattedMessages,
    });

    const responseContent = result.text;

    // Check if we should attempt CRM lead capture
    const leadData = extractLeadFromMessages(formattedMessages);
    if (leadData || saveLead) {
      try {
        const supabase = await createClient();
        const email = leadData?.email || saveLead?.email;
        const name = leadData?.name || saveLead?.name || "AI Chat Lead";
        const company = leadData?.company || saveLead?.company || null;
        const budget = leadData?.budget || saveLead?.budget || null;
        const message = leadData?.message || saveLead?.message || "Submitted via AI Chatbot";

        if (email) {
          // Insert into inquiries
          await supabase.from("inquiries").insert({
            name,
            email,
            company,
            budget,
            message: `[AI Chatbot Lead] ${message}`,
            interests: ["AI Chatbot Qualification"],
            status: "new",
          });

          // Insert into CRM leads table
          await supabase.from("leads").insert({
            name,
            email,
            company,
            budget,
            message: `[AI Chatbot Lead] ${message}`,
            interests: ["Software", "AI"],
            stage: "Lead",
            notes: "Captured and qualified automatically via YARI AI Chatbot widget.",
          });
        }
      } catch (err) {
        console.error("CRM lead save background error:", err);
      }
    }

    return NextResponse.json({ content: responseContent });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat response.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
