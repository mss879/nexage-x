"use server";

import { createClient } from "@/lib/supabase/server";

interface InquiryInput {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message?: string;
  interests: string[];
}

/**
 * Server Action to handle secure contact form submissions.
 * Validates inputs to prevent injection/spam, then inserts into Supabase.
 */
export async function submitInquiry(input: InquiryInput) {
  // 1. Sanitize and validate inputs
  const name = input.name.trim();
  const email = input.email.trim();
  const company = input.company?.trim() || null;
  const budget = input.budget?.trim() || null;
  const message = input.message?.trim() || null;
  const interests = (input.interests || []).map(i => i.trim()).filter(Boolean);

  if (!name || name.length < 2 || name.length > 100) {
    return { success: false, error: "Name must be between 2 and 100 characters." };
  }

  // Basic RFC 5322 email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!email || !emailRegex.test(email) || email.length > 254) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (company && company.length > 100) {
    return { success: false, error: "Company name cannot exceed 100 characters." };
  }

  if (message && message.length > 2000) {
    return { success: false, error: "Message cannot exceed 2000 characters." };
  }

  try {
    // 2. Instantiate server-side Supabase client
    const supabase = await createClient();

    // 3. Insert record into inquiries table
    const { error } = await supabase.from("inquiries").insert({
      name,
      email,
      company,
      budget,
      message,
      interests,
      status: "new"
    });

    if (error) {
      console.error("Database insert error:", error);
      return { success: false, error: "We encountered a database error. Please try again." };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected submission error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
