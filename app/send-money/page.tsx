import Link from "next/link";
import { ArrowLeftRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";

export const metadata = {
  title: "International Transfers | Eveora",
  description: "Eveora international money transfer services.",
};

export default function SendMoneyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Brand />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-eveora-blue"
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-eveora-sky">
            <ArrowLeftRight size={28} className="text-eveora-blue" />
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-eveora-blue">
            Eveora Global Transfers
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-eveora-ink sm:text-4xl">
            Send money across borders.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            We're preparing international transfers to help people send and
            receive money across countries and currencies through approved
            financial partners.
          </p>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-bold text-amber-900">Coming soon</p>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              International transfers are not yet available. No money can
              currently be sent or received through this page.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 shrink-0 text-eveora-blue" size={21} />
              <div>
                <h2 className="font-bold text-eveora-ink">Secure partner network</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Transfers will be introduced through appropriately authorised
                  and approved financial partners.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowLeftRight className="mt-1 shrink-0 text-eveora-blue" size={21} />
              <div>
                <h2 className="font-bold text-eveora-ink">International corridors</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Our planned service includes international sending and
                  receiving, subject to partner coverage and regulatory approval.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-10 inline-flex rounded-xl bg-eveora-navy px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Return to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
