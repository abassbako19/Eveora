"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AUTH_CALLBACK_URL } from "@/lib/site-url";

const providers = [
  { id: "google" as const, label: "Continue with Google", mark: "G" },
  { id: "linkedin_oidc" as const, label: "Continue with LinkedIn", mark: "in" },
  { id: "twitter" as const, label: "Continue with Twitter / X", mark: "𝕏" }
];

export function SocialAuth() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function start(provider: typeof providers[number]["id"]) {
    setBusy(provider); setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${AUTH_CALLBACK_URL}?next=/dashboard` }
      });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Social sign-in could not start. Please try again.");
      setBusy(null);
    }
  }
  return <div className="space-y-3">
    {providers.map(p => <button key={p.id} type="button" onClick={() => start(p.id)} disabled={!!busy} className="social-button w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-slate-50 disabled:opacity-60"><span className="mr-3 inline-grid h-7 w-7 place-items-center rounded-lg bg-slate-100 font-bold text-slate-800">{busy === p.id ? "…" : p.mark}</span>{busy === p.id ? "Connecting…" : p.label}</button>)}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  </div>;
}
