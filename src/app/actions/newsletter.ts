"use server";

import { createClient } from "@/lib/supabase/server";

export async function subscribeNewsletter(formData: FormData | string) {
  try {
    const rawEmail = typeof formData === "string" ? formData : formData.get("email");
    
    if (typeof rawEmail !== "string" || !rawEmail) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const email = rawEmail.trim().toLowerCase();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const supabase = await createClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      if (existing.status === "unsubscribed") {
        // Re-activate subscription
        await supabase
          .from("newsletter_subscribers")
          .update({ status: "active" })
          .eq("id", existing.id);
      }
      return { success: true, message: "You're already subscribed to our newsletter!" };
    }

    // Insert new subscriber
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, status: "active", source: "footer" });

    if (error) {
      console.error("Newsletter DB error:", error);
      return { success: false, error: "Unable to subscribe at this moment. Please try again later." };
    }

    return { success: true, message: "Thank you for subscribing!" };
  } catch (err) {
    console.error("Newsletter exception:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
