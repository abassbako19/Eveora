"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowLeftRight,
  ShieldCheck,
  Globe2,
  LockKeyhole,
  Info,
} from "lucide-react";

const countries = [
  { name: "United States", currency: "USD" },
  { name: "United Kingdom", currency: "GBP" },
  { name: "Eurozone", currency: "EUR" },
  { name: "Canada", currency: "CAD" },
  { name: "Ghana", currency: "GHS" },
  { name: "Kenya", currency: "KES" },
  { name: "South Africa", currency: "ZAR" },
];

export default function SendMoneyExperience() {
  const [recipient, setRecipient] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(countries[0].name);
  const [amount, setAmount] = useState("");

  const selectedCountry = countries.find(
    (item) => item.name === country
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <ArrowLeftRight size={25} />
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Eveora International
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Send money across borders.
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Prepare an international transfer with clear recipient
            details and transparent costs.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="mb-6 text-xl font-bold">
              Transfer details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Sending country
                </label>
                <input
                  value="Nigeria (NGN)"
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Destination country
                </label>
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                >
                  {countries.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name} ({item.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Recipient's full name
                </label>
                <input
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder="Enter recipient's full name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Recipient's email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Amount to send (NGN)
                </label>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter amount in naira"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 shrink-0 text-amber-700" size={20} />
                <div>
                  <p className="font-semibold text-amber-900">
                    Transfers are not yet available
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    This is a preview only. No payment will be
                    collected and no money will be transferred.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-xl bg-slate-300 px-5 py-4 font-bold text-slate-600"
            >
              International transfers coming soon
            </button>
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Globe2 className="mb-4 text-indigo-600" size={28} />
              <h2 className="text-lg font-bold">
                Transfer overview
              </h2>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Destination</span>
                  <span className="font-semibold text-right">
                    {country}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Currency</span>
                  <span className="font-semibold">
                    {selectedCountry?.currency}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-semibold">
                    {amount
                      ? `₦${Number(amount).toLocaleString("en-NG")}`
                      : "Not entered"}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="font-semibold">Exchange rate</p>
                  <p className="mt-1 text-slate-500">
                    To be provided by an approved transfer partner.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Transfer fee</p>
                  <p className="mt-1 text-slate-500">
                    To be confirmed before any future transfer.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
              <ShieldCheck className="mb-3 text-emerald-700" size={28} />
              <h2 className="font-bold text-emerald-900">
                Security comes first
              </h2>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Eveora will require appropriate recipient verification,
                secure payment processing and regulatory checks before
                international transfers are enabled.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-800">
                <LockKeyhole size={16} />
                Protected financial experience
              </div>
            </section>
          </aside>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Eveora · International transfers preview
        </p>
      </div>
    </main>
  );
}
