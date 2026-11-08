import Link from "next/link";
import { ArrowUpRight, Globe2, HeartHandshake, ShieldCheck, Sparkles, Users, WalletCards, HandHeart, FileText, Gift } from "lucide-react";
import { Header } from "@/components/header";
import MotionSystem from "@/components/motion-system";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, type EveoraCurrency } from "@/lib/currency";

const features = [
  { icon: Sparkles, title: "Ask Eveora Assistant", text: "Get guided help understanding the platform and organizing your next steps." },
  { icon: HeartHandshake, title: "Give with purpose", text: "Support people, community initiatives and causes that matter." },
  { icon: Users, title: "Find support", text: "Create a clear request and connect with people willing to help." },
  { icon: Globe2, title: "Discover opportunities", text: "Make room for resources, services, learning and new possibilities." }
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase.from("campaigns").select("id,title,slug,summary,category,target_amount_kobo,target_amount_minor,currency").eq("status","active").order("created_at",{ascending:false}).limit(3);
  return (
    <main className="overflow-hidden">
      <MotionSystem />
      <div className="absolute inset-x-0 top-0 -z-0 h-[760px] bg-[radial-gradient(ellipse_at_top_right,_#e4ebff_0%,_transparent_48%),linear-gradient(180deg,_#f4f7ff_0%,_#f8faff_78%)]" />
      <Header />
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-32 lg:pt-24">
        <div className="landing-hero relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[.16em] text-eveora-blue shadow-sm">
            <Sparkles size={14} /> A world of possibilities
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-[-.055em] text-eveora-ink sm:text-6xl lg:text-7xl">
            A little support can open up <span className="text-eveora-blue">a world.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
            Eveora brings people, resources and opportunities closer together — so more people can move forward, together.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-eveora-blue px-7 py-4 font-semibold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700">
              Join Eveora <ArrowUpRight size={18} />
            </Link>
            <Link href="/campaigns" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-4 font-semibold text-slate-700 hover:border-blue-200 hover:text-eveora-blue">Explore campaigns</Link>
            <Link href="/donate" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-4 font-semibold text-slate-700 hover:border-blue-200 hover:text-eveora-blue">
              Donate to a cause
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-emerald-600" /> Built with security in mind</span>
            <span className="inline-flex items-center gap-2"><Globe2 size={17} className="text-eveora-blue" /> Designed for everyone</span>
          </div>
        </div>
        <div className="landing-art relative mx-auto w-full max-w-xl">
          <div className="absolute -left-8 top-12 h-40 w-40 rounded-full bg-blue-200/50 blur-3xl animate-pulse" />
          <div className="absolute -right-8 bottom-8 h-48 w-48 rounded-full bg-emerald-100 blur-3xl animate-pulse" />
          <div className="relative rounded-[2rem] border border-white/80 bg-white/75 p-4 shadow-soft backdrop-blur-xl sm:p-6">
            <div className="rounded-[1.5rem] bg-eveora-navy p-6 text-white sm:p-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-100">The Eveora community</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-blue-100">Together forward</span>
              </div>
              <div className="my-10">
                <div className="mb-3 text-sm text-blue-100">Every connection creates possibility</div>
                <div className="text-4xl font-bold tracking-tight sm:text-5xl">People first.<br />Possibility always.</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <HeartHandshake className="mb-5 text-eveora-gold" size={23} />
                  <div className="font-semibold">Give support</div>
                  <div className="mt-1 text-xs leading-5 text-blue-100">Make a meaningful difference.</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <WalletCards className="mb-5 text-emerald-300" size={23} />
                  <div className="font-semibold">Find resources</div>
                  <div className="mt-1 text-xs leading-5 text-blue-100">Discover ways to move forward.</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-2 pb-1 pt-5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> A platform built around people</span>
              <Sparkles size={17} className="text-eveora-blue" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 grid max-w-7xl gap-4 px-5 pb-12 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        <Link href="/donate" className="group rounded-3xl border border-blue-100 bg-white p-6 shadow-soft transition hover:-translate-y-1"><HandHeart className="text-eveora-blue" size={28}/><h2 className="mt-4 text-xl font-bold text-eveora-ink">Donate</h2><p className="mt-2 text-sm leading-6 text-slate-600">Support people and causes. Paystack checkout starts in secure test mode.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-eveora-blue">Make a donation <ArrowUpRight size={16}/></span></Link>
        <Link href="/request-assistance" className="group rounded-3xl border border-blue-100 bg-white p-6 shadow-soft transition hover:-translate-y-1"><FileText className="text-eveora-blue" size={28}/><h2 className="mt-4 text-xl font-bold text-eveora-ink">Request assistance</h2><p className="mt-2 text-sm leading-6 text-slate-600">Tell us what support you need and submit a request for review.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-eveora-blue">Start a request <ArrowUpRight size={16}/></span></Link>
        <Link href="/dashboard" className="group rounded-3xl border border-blue-100 bg-white p-6 shadow-soft transition hover:-translate-y-1"><Users className="text-eveora-blue" size={28}/><h2 className="mt-4 text-xl font-bold text-eveora-ink">Your dashboard</h2><p className="mt-2 text-sm leading-6 text-slate-600">Keep track of your account, donation activity and assistance requests.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-eveora-blue">Open dashboard <ArrowUpRight size={16}/></span></Link>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-eveora-blue">Ways to make a difference</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-eveora-ink">Active community campaigns</h2><p className="mt-2 max-w-xl text-slate-600">Explore initiatives published by the Eveora team.</p></div><Link href="/campaigns" className="text-sm font-semibold text-eveora-blue underline">View all campaigns</Link></div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">{campaigns?.map((campaign,index)=><article key={campaign.id} style={{animationDelay:`${index*90}ms`}} className="feature-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft"><p className="text-xs font-bold uppercase tracking-wider text-eveora-blue">{campaign.category}</p><h3 className="mt-3 text-xl font-bold text-eveora-ink">{campaign.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{campaign.summary}</p>{(campaign.target_amount_minor ?? campaign.target_amount_kobo) && (
  <p className="mt-4 text-sm font-semibold text-slate-700">
    Target {formatCurrency(
      Number(campaign.target_amount_minor ?? campaign.target_amount_kobo) / 100,
      (campaign.currency || "NGN") as EveoraCurrency
    )}
  </p>
)}<Link href={`/campaigns/${campaign.slug}`} className="mt-5 inline-flex rounded-xl bg-eveora-blue px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700">Support campaign <ArrowUpRight size={16} className="ml-2"/></Link></article>)}</div>
        {!campaigns?.length&&<div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-7 text-sm text-slate-500">New campaigns will appear here when published.</div>}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-8"><Link href="/campaigns" className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-6 py-4 text-sm font-bold text-eveora-blue shadow-sm transition hover:-translate-y-1">Explore active campaigns <ArrowUpRight size={17}/></Link></section>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-8 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-r from-[#101d45] via-[#1f3a82] to-[#3157d5] p-8 text-white shadow-xl sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div><p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100"><Sparkles size={14}/> Your journey, your impact</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Give. Grow. Discover what is possible.</h2>
              <p className="mt-3 max-w-2xl leading-7 text-blue-100">Explore campaigns, follow your assistance requests, build positive participation and earn Eveora Credits through verified giving and weekly activity.</p>
              <div className="mt-6 flex flex-wrap gap-3"><Link href="/signup" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-900 transition hover:-translate-y-1 hover:shadow-lg">Start your Eveora journey</Link><Link href="/login" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">I already have an account</Link></div>
            </div>
            <div className="reward-orbit mx-auto grid h-44 w-44 place-items-center rounded-full border border-white/20 bg-white/10"><div className="grid h-32 w-32 place-items-center rounded-full border border-white/30 bg-white/10 text-center shadow-2xl"><div><Sparkles className="mx-auto mb-2 text-amber-200" size={30}/><p className="text-lg font-black">Eveora</p><p className="text-xs text-blue-100">Rewards & impact</p></div></div></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-eveora-blue">More than a donation page</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-eveora-ink sm:text-4xl">Useful tools for every step.</h2><p className="mt-3 leading-7 text-slate-600">A connected experience that helps members take action, stay informed and celebrate progress.</p></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[{icon:ShieldCheck,title:"Private document vault",text:"Keep supporting documents attached to your assistance request with access controls."},{icon:Gift,title:"Credits & rewards",text:"Earn Credits for verified donations and weekly login streaks; redeem temporary Premium access."},{icon:FileText,title:"Printable receipts",text:"Find verified donation records and print receipts from your member dashboard."},{icon:Sparkles,title:"Eveora Assistant",text:"Get guided explanations, organize information and prepare clearer assistance requests."}].map(({icon:Icon,title,text},i)=><article key={title} style={{animationDelay:`${i*100}ms`}} className="feature-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-eveora-sky text-eveora-blue"><Icon size={23}/></div><h3 className="mt-5 text-lg font-bold text-eveora-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
        </div>
      </section>

      <section id="mission" className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-eveora-blue">Why Eveora exists</p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-eveora-ink sm:text-5xl">Technology should bring people closer to a better future.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">We are building an accessible global ecosystem where people can support one another, find useful resources and discover opportunities to thrive.</p>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-eveora-blue">One connected ecosystem</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-eveora-ink sm:text-4xl">Different ways to move forward.</h2>
        </div>
        <div id="possibilities" className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="feature-card rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-eveora-sky text-eveora-blue"><Icon size={23} /></div>
              <h3 className="mt-6 text-xl font-bold text-eveora-ink">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="px-5 pb-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-eveora-blue px-8 py-12 text-white sm:px-12 lg:flex-row lg:items-center">
          <div><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">The next chapter starts together.</h2><p className="mt-3 max-w-xl text-blue-100">Join the early Eveora community and help shape what comes next.</p></div>
          <Link href="/signup" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-eveora-blue hover:bg-blue-50">Create your account <ArrowUpRight size={18} /></Link>
        </div>
      </section>
      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">© {new Date().getFullYear()} Eveora. Built for people and possibilities.</footer>
    </main>
  );
}
