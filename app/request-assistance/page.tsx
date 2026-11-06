
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileHeart, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/brand";
import { AssistanceForm } from "@/components/assistance-form";
export default async function RequestAssistancePage(){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login?next=/request-assistance");
 return <main className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-6xl px-5 py-4"><Brand/></div></header><section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[.8fr_1.2fr] lg:py-20"><div><div className="grid h-14 w-14 place-items-center rounded-2xl bg-eveora-sky text-eveora-blue"><FileHeart size={28}/></div><p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-eveora-blue">Request support</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-eveora-ink sm:text-5xl">Tell us what support would make a difference.</h1><p className="mt-5 leading-8 text-slate-600">Use this form to explain your need. Your request will be stored securely for review; it will not automatically trigger a payment or promise of assistance.</p><div className="mt-8 flex gap-3 rounded-2xl border border-blue-100 bg-white p-4 text-sm leading-6 text-slate-600"><ShieldCheck className="mt-1 shrink-0 text-eveora-blue" size={19}/> Keep your information accurate. You can attach up to three private supporting documents (PDF, JPG or PNG), up to 5 MB each. Files are visible only to you and authorized reviewers.</div><Link href="/donate" className="mt-7 inline-block text-sm font-semibold text-eveora-blue underline">Want to support others? Donate instead</Link></div><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-9"><h2 className="text-2xl font-bold text-eveora-ink">Assistance application</h2><p className="mb-7 mt-2 text-sm text-slate-500">Signed in as {user.email}</p><AssistanceForm/></div></section></main>;
}
