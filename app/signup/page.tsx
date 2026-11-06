"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { SocialAuth } from "@/components/social-auth";
import { createClient } from "@/lib/supabase/client";
import { AUTH_CALLBACK_URL } from "@/lib/site-url";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [resending, setResending] = useState(false); const [cooldown, setCooldown] = useState(0); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  useEffect(() => { if (cooldown <= 0) return; const timer = window.setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000); return () => window.clearTimeout(timer); }, [cooldown]);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name.trim() }, emailRedirectTo: AUTH_CALLBACK_URL } });
      if (error) throw error;
      if (data.session) { router.push("/dashboard"); router.refresh(); }
      else { setMessage("Confirmation email requested. Check your inbox and spam folder. You can request another email below after the cooldown."); setCooldown(60); }
    } catch (e) { setError(e instanceof Error ? e.message : "We could not create your account. Please try again."); }
    finally { setBusy(false); }
  }
  async function resend() {
    if (!email.trim()) { setError("Enter your email address first, then request another confirmation email."); return; }
    if (cooldown > 0) return;
    setResending(true); setError(""); setMessage("");
    try { const { error } = await createClient().auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: AUTH_CALLBACK_URL } }); if (error) throw error; setMessage("If this address has an unconfirmed Eveora account, a new confirmation email has been requested. Check your inbox and spam folder."); setCooldown(60); }
    catch (e) { setError(e instanceof Error ? e.message : "We could not resend the email. Please wait before trying again."); }
    finally { setResending(false); }
  }
  return <main className="grid min-h-screen bg-white lg:grid-cols-[.9fr_1.1fr]">
    <aside className="auth-hero hidden flex-col justify-between bg-eveora-navy p-12 text-white lg:flex"><Brand light /><div className="max-w-lg"><p className="text-sm font-semibold uppercase tracking-[.2em] text-blue-200">Welcome to Eveora</p><h1 className="mt-5 text-5xl font-bold leading-tight">Your next possibility starts here.</h1><p className="mt-6 text-lg leading-8 text-blue-100">A connected world begins with people who believe in moving forward together.</p></div><p className="text-sm text-blue-200">People first. Possibility always.</p></aside>
    <section className="flex items-center justify-center px-5 py-12"><div className="auth-card w-full max-w-md"><div className="mb-10 lg:hidden"><Brand /></div><p className="text-sm font-semibold text-eveora-blue">CREATE YOUR ACCOUNT</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-eveora-ink">Join Eveora</h2><p className="mt-2 text-slate-500">Create an account to become part of the community.</p>
      <div className="mt-7"><SocialAuth /></div><div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200"/>or use email<span className="h-px flex-1 bg-slate-200"/></div>
      <form onSubmit={handleSubmit} className="space-y-5"><div><label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">Full name</label><input id="name" required value={name} onChange={e=>setName(e.target.value)} autoComplete="name" className="auth-input w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-eveora-blue focus:ring-4 focus:ring-blue-100" placeholder="Your name" /></div>
      <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" className="auth-input w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-eveora-blue focus:ring-4 focus:ring-blue-100" placeholder="you@example.com" /></div>
      <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label><input id="password" type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" className="auth-input w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-eveora-blue focus:ring-4 focus:ring-blue-100" placeholder="At least 8 characters" /></div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">{message}</p>}
      <button disabled={busy} className="auth-primary w-full rounded-xl bg-eveora-blue px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Creating account…" : "Create account"}</button></form>
      <button type="button" onClick={resend} disabled={resending || cooldown > 0} className="mt-4 w-full rounded-xl border border-blue-100 px-4 py-3 text-sm font-semibold text-eveora-blue transition hover:bg-blue-50 disabled:opacity-60">{resending ? "Requesting email…" : cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend confirmation email"}</button>
      <p className="mt-7 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-eveora-blue hover:underline">Log in</Link></p><p className="mt-8 text-center text-xs leading-5 text-slate-400">By continuing, you agree to use Eveora responsibly and respectfully.</p>
    </div></section></main>;
}
