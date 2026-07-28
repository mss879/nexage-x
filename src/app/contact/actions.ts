"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clientIpFrom } from "@/lib/rate-limit";

interface InquiryInput {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message?: string;
  interests: string[];
  /** Honeypot — hidden from humans; a filled value means a bot submitted. */
  website?: string;
}

const MAX_INTERESTS = 12;
const MAX_INTEREST_LENGTH = 40;

/**
 * Server Action to handle secure contact form submissions.
 * Server actions are publicly callable HTTP endpoints, so every field is
 * type-checked and length-capped here, submissions are rate-limited per IP,
 * and a honeypot field silently drops bot traffic before it reaches Supabase.
 */
export async function submitInquiry(input: InquiryInput) {
  // 0. Reject malformed payloads — callers are not limited to our form and
  // can post arbitrary JSON at this action.
  if (typeof input !== "object" || input === null) {
    return { success: false, error: "Invalid submission." };
  }

  // Honeypot: report success so bots don't learn they were filtered.
  if (typeof input.website === "string" && input.website.trim() !== "") {
    return { success: true };
  }

  // Rate limit: 5 submissions per IP per 10 minutes.
  const ip = clientIpFrom(await headers());
  if (!checkRateLimit(`inquiry:${ip}`, 5, 10 * 60 * 1000)) {
    return { success: false, error: "Too many submissions. Please try again in a few minutes." };
  }

  // 1. Sanitize and validate inputs
  if (
    typeof input.name !== "string" ||
    typeof input.email !== "string" ||
    (input.company !== undefined && typeof input.company !== "string") ||
    (input.budget !== undefined && typeof input.budget !== "string") ||
    (input.message !== undefined && typeof input.message !== "string")
  ) {
    return { success: false, error: "Invalid submission." };
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const company = input.company?.trim() || null;
  const budget = input.budget?.trim() || null;
  const message = input.message?.trim() || null;
  const interests = (Array.isArray(input.interests) ? input.interests : [])
    .filter((i): i is string => typeof i === "string")
    .map((i) => i.trim())
    .filter((i) => i.length > 0 && i.length <= MAX_INTEREST_LENGTH)
    .slice(0, MAX_INTERESTS);

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

  if (budget && budget.length > 50) {
    return { success: false, error: "Budget selection is invalid." };
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
