"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAllowedAdmin } from "@/lib/admin";
import { checkRateLimit, clientIpFrom } from "@/lib/rate-limit";

const STAGES = ["Lead", "Contacted", "Qualified", "Proposal", "Won", "Lost"] as const;
const INQUIRY_STATUSES = ["new", "converted", "archived"] as const;

/**
 * Log in administrative users securely using Supabase Auth.
 * Attempts are rate-limited per IP and errors are kept generic so the
 * response never confirms whether an account exists.
 */
export async function loginAdmin(prevState: unknown, formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  const ip = clientIpFrom(await headers());
  if (!checkRateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)) {
    return { success: false, error: "Too many login attempts. Please try again later." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: "Invalid email or password." };
    }

    // Even with valid credentials, only allowlisted admins may enter.
    if (!isAllowedAdmin(data.user?.email)) {
      await supabase.auth.signOut();
      return { success: false, error: "This account is not authorized to access the admin portal." };
    }

    return { success: true };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Log out administrative users and clear session cookies.
 */
export async function logoutAdmin() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (err) {
    console.error("Logout error:", err);
    return { success: false, error: "An unexpected error occurred during logout." };
  }
}

/**
 * Check that the caller is an authenticated, allowlisted admin.
 * Used internally inside actions to secure database writes.
 */
async function checkAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || !isAllowedAdmin(user.email)) {
    throw new Error("Unauthorized access");
  }
  return supabase;
}

// ── CRM Leads Actions ────────────────────────────────────────────────────────
interface LeadInput {
  name: string;
  email?: string;
  company?: string;
  budget?: string;
  message?: string;
  interests?: string[];
  stage?: string;
  value?: number;
  notes?: string;
}

function cleanString(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLen) return null;
  return trimmed;
}

function cleanInterests(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((i): i is string => typeof i === "string")
    .map((i) => i.trim())
    .filter((i) => i.length > 0 && i.length <= 40)
    .slice(0, 12);
}

function cleanValue(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, 999_999_999);
}

function cleanStage(value: unknown): (typeof STAGES)[number] {
  return STAGES.includes(value as (typeof STAGES)[number])
    ? (value as (typeof STAGES)[number])
    : "Lead";
}

/**
 * Creates a new CRM Lead manually.
 */
export async function createLead(input: LeadInput) {
  try {
    const supabase = await checkAuth();

    const name = cleanString(input?.name, 100);
    if (!name) {
      return { success: false, error: "Lead name is required (max 100 characters)." };
    }

    const { error } = await supabase.from("leads").insert({
      name,
      email: cleanString(input.email, 254),
      company: cleanString(input.company, 100),
      budget: cleanString(input.budget, 50),
      message: cleanString(input.message, 2000),
      interests: cleanInterests(input.interests),
      stage: cleanStage(input.stage),
      value: cleanValue(input.value),
      notes: cleanString(input.notes, 2000),
    });

    if (error) throw error;
    revalidatePath("/admin/crm");
    return { success: true };
  } catch (err) {
    console.error("Create lead error:", err);
    return { success: false, error: "Failed to create lead." };
  }
}

/**
 * Updates an existing CRM Lead (including stage movement or detailed fields).
 */
export async function updateLead(id: string, updates: Partial<LeadInput>) {
  try {
    const supabase = await checkAuth();

    if (typeof id !== "string" || !id) {
      return { success: false, error: "Invalid lead id." };
    }

    const cleanUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) {
      const name = cleanString(updates.name, 100);
      if (!name) return { success: false, error: "Lead name is required (max 100 characters)." };
      cleanUpdates.name = name;
    }
    if (updates.email !== undefined) cleanUpdates.email = cleanString(updates.email, 254);
    if (updates.company !== undefined) cleanUpdates.company = cleanString(updates.company, 100);
    if (updates.budget !== undefined) cleanUpdates.budget = cleanString(updates.budget, 50);
    if (updates.message !== undefined) cleanUpdates.message = cleanString(updates.message, 2000);
    if (updates.interests !== undefined) cleanUpdates.interests = cleanInterests(updates.interests);
    if (updates.stage !== undefined) cleanUpdates.stage = cleanStage(updates.stage);
    if (updates.value !== undefined) cleanUpdates.value = cleanValue(updates.value);
    if (updates.notes !== undefined) cleanUpdates.notes = cleanString(updates.notes, 2000);

    const { error } = await supabase
      .from("leads")
      .update(cleanUpdates)
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/crm");
    return { success: true };
  } catch (err) {
    console.error("Update lead error:", err);
    return { success: false, error: "Failed to update lead." };
  }
}

/**
 * Deletes a CRM Lead.
 */
export async function deleteLead(id: string) {
  try {
    const supabase = await checkAuth();

    if (typeof id !== "string" || !id) {
      return { success: false, error: "Invalid lead id." };
    }

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/crm");
    return { success: true };
  } catch (err) {
    console.error("Delete lead error:", err);
    return { success: false, error: "Failed to delete lead." };
  }
}

// ── Inquiries Actions ────────────────────────────────────────────────────────

/**
 * Archive or change the status of an inquiry.
 */
export async function updateInquiryStatus(id: string, status: "new" | "converted" | "archived") {
  try {
    const supabase = await checkAuth();

    if (typeof id !== "string" || !id) {
      return { success: false, error: "Invalid inquiry id." };
    }
    if (!INQUIRY_STATUSES.includes(status)) {
      return { success: false, error: "Invalid inquiry status." };
    }

    const { error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (err) {
    console.error("Update inquiry status error:", err);
    return { success: false, error: "Failed to update inquiry." };
  }
}

/**
 * Converts a contact inquiry into a CRM Lead and updates the inquiry status to 'converted'.
 */
export async function convertInquiryToLead(inquiryId: string) {
  try {
    const supabase = await checkAuth();

    if (typeof inquiryId !== "string" || !inquiryId) {
      return { success: false, error: "Invalid inquiry id." };
    }

    // 1. Fetch original inquiry
    const { data: inquiry, error: fetchError } = await supabase
      .from("inquiries")
      .select("*")
      .eq("id", inquiryId)
      .single();

    if (fetchError || !inquiry) {
      throw new Error(fetchError?.message || "Inquiry not found.");
    }

    // 2. Insert into leads table
    const { error: insertError } = await supabase.from("leads").insert({
      name: inquiry.name,
      email: inquiry.email,
      company: inquiry.company,
      budget: inquiry.budget,
      message: inquiry.message,
      interests: inquiry.interests,
      stage: "Lead", // Default stage
      value: 0,
      notes: `Converted from contact form inquiry on ${new Date().toLocaleDateString("en-GB")}.`,
      source_inquiry_id: inquiry.id,
    });

    if (insertError) throw insertError;

    // 3. Mark inquiry as converted
    const { error: statusError } = await supabase
      .from("inquiries")
      .update({ status: "converted" })
      .eq("id", inquiryId);

    if (statusError) throw statusError;

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin/crm");
    return { success: true };
  } catch (err) {
    console.error("Convert inquiry error:", err);
    return { success: false, error: "Failed to convert inquiry to lead." };
  }
}

// ── Newsletter Subscribers Actions ───────────────────────────────────────────
export async function deleteSubscriber(id: string) {
  try {
    const supabase = await checkAuth();
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/subscribers");
    return { success: true };
  } catch (err) {
    console.error("Delete subscriber error:", err);
    return { success: false, error: "Failed to delete subscriber." };
  }
}

export async function updateSubscriberStatus(id: string, status: "active" | "unsubscribed") {
  try {
    const supabase = await checkAuth();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/subscribers");
    return { success: true };
  } catch (err) {
    console.error("Update subscriber status error:", err);
    return { success: false, error: "Failed to update subscriber status." };
  }
}
