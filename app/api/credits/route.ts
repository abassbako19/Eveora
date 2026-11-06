import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export const runtime = "nodejs";
async function context() {
  const session = await createClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: "Please sign in." }, { status: 401 }) };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { response: NextResponse.json({ error: "Credits are not configured yet. Apply the Eveora v1.4 migration and set the server key." }, { status: 503 }) };
  return { user, db: createAdmin(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) };
}
export async function GET() {
  const ctx = await context(); if ("response" in ctx) return ctx.response;
  const { user, db } = ctx;
  const [{ data: ledger, error }, { data: weekly }, { data: premium }] = await Promise.all([
    db.from("eveora_credits_ledger").select("id,amount,event_type,description,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
    db.from("eveora_weekly_activity").select("streak_weeks,week_start").eq("user_id", user.id).order("week_start", { ascending: false }).limit(1).maybeSingle(),
    db.from("eveora_premium_entitlements").select("expires_at").eq("user_id", user.id).maybeSingle()
  ]);
  if (error) return NextResponse.json({ error: "Credits tables are not ready. Apply the v1.4 migration first." }, { status: 503 });
  const { data: totalRows } = await db.from("eveora_credits_ledger").select("amount").eq("user_id", user.id);
  const balance = (totalRows || []).reduce((sum, row) => sum + Number(row.amount), 0);
  return NextResponse.json({ balance, ledger: ledger || [], streak: weekly?.streak_weeks || 0, premiumExpiresAt: premium?.expires_at || null });
}
export async function POST(request: Request) {
  const ctx = await context(); if ("response" in ctx) return ctx.response;
  const { user, db } = ctx;
  try {
    const body = await request.json();
    if (body.action === "weekly-login") {
      const { data, error } = await db.rpc("eveora_record_weekly_login", { p_user_id: user.id });
      if (error) return NextResponse.json({ error: "Could not record this week's login. Check that the v1.4 migration has been applied." }, { status: 503 });
      return NextResponse.json({ ok: true, result: data?.[0] || { credits_awarded: 0, streak_weeks: 0 } });
    }
    if (body.action === "redeem-premium") {
      const days = Number(body.days); const cost = days === 7 ? 100 : days === 30 ? 250 : 0;
      if (!cost) return NextResponse.json({ error: "Choose a 7-day or 30-day Premium reward." }, { status: 400 });
      const { data, error } = await db.rpc("eveora_redeem_premium", { p_user_id: user.id, p_days: days, p_cost: cost });
      if (error) return NextResponse.json({ error: error.message.includes("Not enough Credits") ? "You don't have enough Credits for this reward." : "Could not redeem Premium. Please try again." }, { status: 400 });
      return NextResponse.json({ ok: true, expiresAt: data });
    }
    return NextResponse.json({ error: "Unknown Credits action." }, { status: 400 });
  } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
}
