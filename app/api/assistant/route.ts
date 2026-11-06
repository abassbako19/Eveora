import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const requestWindows = new Map<string, { startedAt: number; count: number }>();

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in to use Eveora Assistant." }, { status: 401 });
  const now = Date.now();
  const windowState = requestWindows.get(user.id);
  if (windowState && now - windowState.startedAt < 60_000 && windowState.count >= 10) {
    return NextResponse.json({ error: "You've reached the short-term message limit. Please wait a minute and try again." }, { status: 429 });
  }
  if (!windowState || now - windowState.startedAt >= 60_000) requestWindows.set(user.id, { startedAt: now, count: 1 });
  else requestWindows.set(user.id, { ...windowState, count: windowState.count + 1 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Eveora Assistant is not configured yet. Add OPENAI_API_KEY to your Render environment variables." }, { status: 503 });

  let body: { messages?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 12) return NextResponse.json({ error: "Send between 1 and 12 recent messages." }, { status: 400 });
  const messages = body.messages.map((item: any) => ({ role: item?.role, content: typeof item?.content === "string" ? item.content.slice(0, 2500) : "" })).filter((item: any) => ["user", "assistant"].includes(item.role) && item.content.trim());
  if (!messages.length || messages[messages.length - 1].role !== "user") return NextResponse.json({ error: "Please enter a message." }, { status: 400 });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-6-luna",
        instructions: "You are Eveora Assistant, a compassionate and practical guide for a global human-support and opportunities platform. Help people understand how to use Eveora, describe the kind of support or opportunity they are looking for, organize their next steps, and draft clear requests. Be respectful, inclusive, concise, and ask only one useful question at a time. Never claim that a request is approved, that funding or aid is guaranteed, or that you have contacted a donor or agency. Do not make eligibility decisions or invent available services. Do not request passwords, bank PINs, full card details, government ID numbers, or unnecessary sensitive information. For urgent danger, encourage contacting local emergency services or a trusted local organization. Explain that you are an AI guide and that important decisions require human review. Payments and financial transfers are not enabled in this version of Eveora.",
        input: messages.map((m: any) => ({ role: m.role, content: m.content }))
      }), signal: AbortSignal.timeout(30000)
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "The assistant is temporarily unavailable. Please try again shortly." }, { status: 502 });
    const answer = (data.output || []).flatMap((item: any) => item.content || []).filter((part: any) => part.type === "output_text").map((part: any) => part.text).join("\n").trim();
    if (!answer) return NextResponse.json({ error: "The assistant did not return a response. Please try again." }, { status: 502 });
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: "We could not reach Eveora Assistant. Please try again." }, { status: 502 });
  }
}
