"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Log in administrative users securely using Supabase Auth.
 */
export async function loginAdmin(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Return custom friendly message or raw error message
      return { success: false, error: error.message };
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
 * Check if the user is authenticated. Throws an error or returns false if not.
 * Used internally inside actions to secure database writes.
 */
async function checkAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
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

/**
 * Creates a new CRM Lead manually.
 */
export async function createLead(input: LeadInput) {
  try {
    const supabase = await checkAuth();

    const { error } = await supabase.from("leads").insert({
      name: input.name.trim(),
      email: input.email?.trim() || null,
      company: input.company?.trim() || null,
      budget: input.budget?.trim() || null,
      message: input.message?.trim() || null,
      interests: input.interests || [],
      stage: input.stage || "Lead",
      value: input.value || 0,
      notes: input.notes || null,
    });

    if (error) throw error;
    revalidatePath("/admin/crm");
    return { success: true };
  } catch (err: any) {
    console.error("Create lead error:", err);
    return { success: false, error: err.message || "Failed to create lead." };
  }
}

/**
 * Updates an existing CRM Lead (including stage movement or detailed fields).
 */
export async function updateLead(id: string, updates: Partial<LeadInput>) {
  try {
    const supabase = await checkAuth();

    const cleanUpdates: any = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
    if (updates.email !== undefined) cleanUpdates.email = updates.email.trim() || null;
    if (updates.company !== undefined) cleanUpdates.company = updates.company.trim() || null;
    if (updates.budget !== undefined) cleanUpdates.budget = updates.budget.trim() || null;
    if (updates.message !== undefined) cleanUpdates.message = updates.message.trim() || null;
    if (updates.interests !== undefined) cleanUpdates.interests = updates.interests;
    if (updates.stage !== undefined) cleanUpdates.stage = updates.stage;
    if (updates.value !== undefined) cleanUpdates.value = updates.value;
    if (updates.notes !== undefined) cleanUpdates.notes = updates.notes;

    const { error } = await supabase
      .from("leads")
      .update(cleanUpdates)
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/crm");
    return { success: true };
  } catch (err: any) {
    console.error("Update lead error:", err);
    return { success: false, error: err.message || "Failed to update lead." };
  }
}

/**
 * Deletes a CRM Lead.
 */
export async function deleteLead(id: string) {
  try {
    const supabase = await checkAuth();

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/crm");
    return { success: true };
  } catch (err: any) {
    console.error("Delete lead error:", err);
    return { success: false, error: err.message || "Failed to delete lead." };
  }
}

// ── Inquiries Actions ────────────────────────────────────────────────────────

/**
 * Archive or change the status of an inquiry.
 */
export async function updateInquiryStatus(id: string, status: "new" | "converted" | "archived") {
  try {
    const supabase = await checkAuth();

    const { error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (err: any) {
    console.error("Update inquiry status error:", err);
    return { success: false, error: err.message || "Failed to update inquiry." };
  }
}

/**
 * Converts a contact inquiry into a CRM Lead and updates the inquiry status to 'converted'.
 */
export async function convertInquiryToLead(inquiryId: string) {
  try {
    const supabase = await checkAuth();

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
  } catch (err: any) {
    console.error("Convert inquiry error:", err);
    return { success: false, error: err.message || "Failed to convert inquiry to lead." };
  }
}
