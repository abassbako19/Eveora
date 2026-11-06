
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: "Please sign in with an email address before donating." }, { status: 401 });
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: "Paystack is not configured yet. Add the test secret key in Render environment variables." }, { status: 503 });
    if (process.env.PAYSTACK_MODE !== "test" || !secret.startsWith("sk_test_")) return NextResponse.json({ error: "Payments are locked. Configure Paystack's test secret key and PAYSTACK_MODE=test." }, { status: 503 });
    const body = await request.json();
    const amount = Number(body.amount);
    if (!Number.isSafeInteger(amount) || amount < 100 || amount > 5_000_000) return NextResponse.json({ error: "Donation must be between ₦100 and ₦5,000,000." }, { status: 400 });
    const donorName = typeof body.donorName === "string" ? body.donorName.trim().slice(0,100) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0,500) : "";
    const campaignId = typeof body.campaignId === "string" ? body.campaignId : null;
    if (campaignId) { const { data: campaign } = await supabase.from("campaigns").select("id").eq("id", campaignId).eq("status", "active").maybeSingle(); if (!campaign) return NextResponse.json({ error: "This campaign is not currently accepting donations." }, { status: 400 }); }
    const reference = `EVE-${randomUUID().replaceAll("-","").slice(0,24)}`;
    const { data: donation, error: insertError } = await supabase.from("eveora_donations").insert({
      user_id: user.id, reference, amount_kobo: amount * 100, currency: "NGN",
      status: "pending", donor_name: donorName || null, message: message || null, campaign_id: campaignId
    }).select("id").single();
    if (insertError || !donation) return NextResponse.json({ error: "Could not save your donation. Please try again." }, { status: 500 });
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/,"");
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, amount: amount * 100, currency: "NGN", reference, callback_url: `${origin}/donate/verify`, metadata: { donation_id: donation.id, user_id: user.id, custom_fields: [{ display_name: "Eveora donation", variable_name: "donation_type", value: "Community donation" }] } }),
      cache: "no-store"
    });
    const result = await response.json();
    if (!response.ok || !result.status || !result.data?.authorization_url) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        const admin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
        await admin.from("eveora_donations").update({ status: "failed" }).eq("id", donation.id);
      }
      return NextResponse.json({ error: result.message || "Paystack could not initialize this test transaction." }, { status: 502 });
    }
    return NextResponse.json({ authorization_url: result.data.authorization_url, reference });
  } catch {
    return NextResponse.json({ error: "Unable to initialize payment. Please try again." }, { status: 500 });
  }
}
