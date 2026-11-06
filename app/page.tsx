import Link from "next/link";
import { ArrowUpRight, Globe2, HeartHandshake, ShieldCheck, Sparkles, Users, WalletCards } from "lucide-react";
import { Header } from "@/components/header";

const features = [
  { icon: HeartHandshake, title: "Give with purpose", text: "Support people, community initiatives and causes that matter." },
  { icon: Users, title: "Find support", text: "Create a clear request and connect with people willing to help." },
  { icon: Globe2, title: "Discover opportunities", text: "Make room for resources, services, learning and new possibilities." }
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-0 h-[760px] bg-[radial-gradient(ellipse_at_top_right,_#e4ebff_0%,_transparent_48%),linear-gradient(180deg,_#f4f7ff_0%,_#f8faff_78%)]" />
      <Header />
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-32 lg:pt-24">
        <div className="relative z-10">
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
            <a href="#mission" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-4 font-semibold text-slate-700 hover:border-blue-200 hover:text-eveora-blue">
              Explore our mission
            </a>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-emerald-600" /> Built with security in mind</span>
            <span className="inline-flex items-center gap-2"><Globe2 size={17} className="text-eveora-blue" /> Designed for everyone</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-8 top-12 h-40 w-40 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="absolute -right-8 bottom-8 h-48 w-48 rounded-full bg-emerald-100 blur-3xl" />
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
        <div id="possibilities" className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
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
