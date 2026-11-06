"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Your password has been updated. You can now log in.");
      setTimeout(() => router.push("/login"), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not update your password.");
    } finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-soft sm:p-10">
        <Brand />
        <h1 className="mt-10 text-3xl font-bold tracking-tight text-eveora-ink">Choose a new password</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">New password</label><input id="password" type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-eveora-blue focus:ring-4 focus:ring-blue-100" placeholder="At least 8 characters" /></div>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-eveora-blue px-5 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? "Updating…" : "Update password"}</button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-500"><Link href="/login" className="font-semibold text-eveora-blue hover:underline">Back to login</Link></p>
      </section>
    </main>
  );
}
