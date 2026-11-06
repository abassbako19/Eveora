import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Crown, BookOpen, BarChart3, Users, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
export default async function PremiumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("eveora_premium_entitlements").select("expires_at").eq("user_id", user.id).maybeSingle();
  const active = !!data?.expires_at && new Date(data.expires_at).getTime() > Date.now();
  return <main className="min-h-screen bg-slate-50 px-5 py-12"><div className="mx-auto max-w-4xl">
    <Link href="/dashboard" className="text-sm font-semibold text-indigo-700 hover:underline">← Back to dashboard</Link>
    <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#101d45] to-[#3157d5] p-8 text-white shadow-xl">
      <div className="flex items-center gap-3"><Crown size={30} className="text-amber-200"/><span className="text-xs font-bold uppercase tracking-[.2em] text-blue-100">Eveora Premium</span></div>
      <h1 className="mt-5 text-3xl font-black sm:text-4xl">{active ? "Welcome to Premium." : "Unlock your Premium space."}</h1>
      <p className="mt-3 max-w-2xl leading-7 text-blue-100">{active ? `Your temporary Premium access is active until ${new Date(data!.expires_at).toLocaleString()}.` : "Redeem Eveora Credits for temporary access to selected enhanced experiences."}</p>
      {!active&&<Link href="/dashboard#credits" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-bold text-indigo-900 hover:-translate-y-0.5">Visit Credits wallet</Link>}
      {active&&<div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-300/15 px-4 py-2 text-sm font-semibold text-emerald-100"><Sparkles size={16}/> Premium access active</div>}
    </section>
    <div className="mt-7 grid gap-4 sm:grid-cols-2">
      {[{Icon:BarChart3,title:"Expanded personal insights",desc:"A richer view of your own donation and participation activity as these analytics roll out."},{Icon:BookOpen,title:"Curated learning library",desc:"Explore practical guides and resources selected for the Eveora community."},{Icon:Users,title:"Premium community sessions",desc:"See announcements for special learning sessions and community events when scheduled."},{Icon:Sparkles,title:"Profile themes and extras",desc:"Discover additional profile customization options as they become available."}].map(({Icon,title,desc})=><article key={title} className="rounded-2xl border border-slate-200 bg-white p-6"><Icon className="text-indigo-700" size={24}/><h2 className="mt-3 font-bold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p></article>)}
    </div>
    <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Premium is a convenience and content-access reward only. It never improves eligibility, review priority, verification outcomes or access to another member's private information.</p>
  </div></main>;
}
