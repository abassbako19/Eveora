"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`
      });
      if (error) throw error;
      setMessage("If the address is registered and email delivery is available, a password-reset link will be sent.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not request a reset link.");
    } finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-soft sm:p-10">
        <Brand />
        <h1 className="mt-10 text-3xl font-bold tracking-tight text-eveora-ink">Reset your password</h1>
        <p className="mt-2 text-slate-500">Enter your account email and we'll request a reset link.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-eveora-blue focus:ring-4 focus:ring-blue-100" placeholder="you@example.com" /></div>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">{message}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-eveora-blue px-5 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? "Requesting…" : "Send reset link"}</button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-500"><Link href="/login" className="font-semibold text-eveora-blue hover:underline">Back to login</Link></p>
      </section>
    </main>
  );
}
