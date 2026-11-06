
import Link from "next/link";
import { redirect } from "next/navigation";
import { HeartHandshake, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/brand";
import { DonationForm } from "@/components/donation-form";

export default async function DonatePage({ searchParams }: { searchParams: Promise<{ status?: string; reference?: string; campaign?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/donate");
  const params = await searchParams;
  const { data: campaigns } = await supabase.from("campaigns").select("id,title").eq("status","active").order("created_at",{ascending:false});
  return <main className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-6xl px-5 py-4"><Brand/></div></header><section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[.9fr_1.1fr] lg:py-20"><div><div className="grid h-14 w-14 place-items-center rounded-2xl bg-eveora-sky text-eveora-blue"><HeartHandshake size={28}/></div><p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-eveora-blue">Give with purpose</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-eveora-ink sm:text-5xl">Your kindness can move someone forward.</h1><p className="mt-5 leading-8 text-slate-600">Make a voluntary contribution to support Eveora's assistance mission. Donations and assistance applications are handled separately.</p><div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><ShieldCheck className="mt-1 shrink-0" size={19}/> Payment verification happens on our server. This release is configured for Paystack test mode, not live money collection.</div><Link href="/campaigns" className="mt-7 mr-5 inline-block text-sm font-semibold text-eveora-blue underline">Explore campaigns</Link><Link href="/request-assistance" className="mt-7 inline-block text-sm font-semibold text-eveora-blue underline">Need help instead? Request assistance</Link></div><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-9">{params.status==="success"&&<div className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Payment verification completed. Check your donation status in your dashboard.</div>}{params.status==="failed"&&<div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">We could not verify that payment. If you were charged, contact support with your reference.</div>}<h2 className="mb-2 text-2xl font-bold text-eveora-ink">Make a donation</h2><p className="mb-7 text-sm text-slate-500">Signed in as {user.email}</p><DonationForm campaigns={campaigns || []} selectedCampaign={params.campaign || ""}/></div></section></main>;
}
