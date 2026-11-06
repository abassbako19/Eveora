"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard"); router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in. Check your details and try again.");
    } finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#e7edff_0%,_#f8faff_55%)] px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-white bg-white p-8 shadow-soft sm:p-10">
        <Brand />
        <p className="mt-10 text-sm font-semibold text-eveora-blue">WELCOME BACK</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-eveora-ink">Log in to Eveora</h1>
        <p className="mt-2 text-slate-500">Continue where you left off.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-eveora-blue focus:ring-4 focus:ring-blue-100" placeholder="you@example.com" /></div>
          <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label><input id="password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-eveora-blue focus:ring-4 focus:ring-blue-100" placeholder="Your password" /></div>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="text-right"><Link href="/forgot-password" className="text-sm font-semibold text-eveora-blue hover:underline">Forgot password?</Link></div>
          <button disabled={busy} className="w-full rounded-xl bg-eveora-blue px-5 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? "Signing in…" : "Log in"}</button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-500">New to Eveora? <Link href="/signup" className="font-semibold text-eveora-blue hover:underline">Create an account</Link></p>
        <Link href="/" className="mt-8 block text-center text-sm text-slate-400 hover:text-eveora-blue">Back to home</Link>
      </section>
    </main>
  );
}
