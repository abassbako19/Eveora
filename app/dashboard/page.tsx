import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, HeartHandshake, Compass, UserRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const fullName = user.user_metadata?.display_name || user.email?.split("@")[0] || "there";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Brand /><form action="/auth/signout" method="post"><button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Sign out</button></form></div></header>
      <section className="mx-auto max-w-7xl px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-[.16em] text-eveora-blue">Your Eveora space</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-eveora-ink sm:text-4xl">Welcome, {fullName}.</h1>
        <p className="mt-3 max-w-2xl text-slate-600">This is the beginning of your Eveora journey. We're building tools that connect people with support, resources and opportunities.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[{icon:HeartHandshake,title:"Give support",desc:"Discover ways to help people and causes."},{icon:Compass,title:"Explore opportunities",desc:"Find resources and possibilities."},{icon:UserRound,title:"Your profile",desc:"Your personal space and account details."}].map(({icon:Icon,title,desc})=><article key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-eveora-sky text-eveora-blue"><Icon size={22}/></div><h2 className="mt-5 text-xl font-bold text-eveora-ink">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400">Coming soon <ArrowUpRight size={15}/></span></article>)}
        </div>
        <div className="mt-8 rounded-3xl bg-eveora-navy p-8 text-white"><h2 className="text-2xl font-bold">Built around people.</h2><p className="mt-2 max-w-2xl leading-7 text-blue-100">Eveora is being developed in stages. Financial transactions and payments are not enabled in this starter release.</p><Link href="/" className="mt-5 inline-flex text-sm font-semibold text-white underline underline-offset-4">Explore the public site</Link></div>
      </section>
    </main>
  );
}
