import Link from "next/link";
import { Brand } from "@/components/brand";

export function Header() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
      <Brand />
      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
        <a href="#mission" className="hover:text-eveora-blue">Our mission</a>
        <a href="#how-it-works" className="hover:text-eveora-blue">How it works</a>
        <a href="#possibilities" className="hover:text-eveora-blue">Possibilities</a>
        <Link href="/donate" className="hover:text-eveora-blue">Donate</Link>
        <Link href="/request-assistance" className="hover:text-eveora-blue">Get help</Link>
      </nav>
      <div className="flex items-center gap-3">
        <Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white sm:inline-flex">Log in</Link>
        <Link href="/signup" className="rounded-xl bg-eveora-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">Get started</Link>
      </div>
    </header>
  );
}
