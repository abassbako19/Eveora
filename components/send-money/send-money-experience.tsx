"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { countries as countryData } from "countries-list";
import {
  ArrowLeft,
  ArrowLeftRight,
  ShieldCheck,
  Globe2,
  LockKeyhole,
  Info,
  Search,
  ChevronDown,
} from "lucide-react";

type CountryOption = {
  code: string;
  name: string;
  currency: string;
};

const allCountries: CountryOption[] = Object.entries(countryData)
  .map(([code, item]) => ({
    code,
    name: item.name,
    currency: item.currency?.[0] ?? "Currency unavailable",
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

function CountryPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (code: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selected = allCountries.find((item) => item.code === value);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allCountries;

    return allCountries.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.currency.toLowerCase().includes(term)
    );
  }, [search]);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-semibold">{label}</label>

      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setSearch("");
        }}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-slate-900 outline-none transition hover:border-indigo-400 focus:border-indigo-500"
      >
        <span className="min-w-0">
          <span className="block truncate font-medium">
            {selected?.name ?? "Choose a country"}
          </span>
          <span className="block text-sm text-slate-500">
            {selected
              ? `${selected.code} · ${selected.currency}`
              : "Select a country"}
          </span>
        </span>
        <ChevronDown size={18} className="shrink-0 text-slate-500" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search country or currency..."
                className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {filtered.length} countries and territories
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <button
                  type="button"
                  key={item.code}
                  onClick={() => {
                    onChange(item.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left hover:bg-indigo-50 ${
                    item.code === value ? "bg-indigo-50" : ""
                  }`}
                >
                  <span className="font-medium text-slate-800">
                    {item.name}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {item.currency}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                No matching country found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SendMoneyExperience() {
  const [recipient, setRecipient] = useState("");
  const [email, setEmail] = useState("");
  const [sendingCode, setSendingCode] = useState("NG");
  const [destinationCode, setDestinationCode] = useState("US");
  const [amount, setAmount] = useState("");

  const sendingCountry = allCountries.find(
    (item) => item.code === sendingCode
  );
  const destinationCountry = allCountries.find(
    (item) => item.code === destinationCode
  );

  const sendingCurrency = sendingCountry?.currency ?? "Currency unavailable";

  const formattedAmount = (() => {
    if (!amount) return "Not entered";
    if (!sendingCurrency || sendingCurrency === "Currency unavailable") {
      return `${amount} ${sendingCurrency}`;
    }

    try {
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency: sendingCurrency,
        maximumFractionDigits: 2,
      }).format(Number(amount));
    } catch {
      return `${amount} ${sendingCurrency}`;
    }
  })();

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
            Choose a sending country and destination from our worldwide
            country list, then prepare your transfer details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="mb-6 text-xl font-bold">Transfer details</h2>

            <div className="space-y-5">
              <CountryPicker
                label="Sending country"
                value={sendingCode}
                onChange={setSendingCode}
              />

              <CountryPicker
                label="Destination country"
                value={destinationCode}
                onChange={setDestinationCode}
              />

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Recipient&apos;s full name
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
                  Recipient&apos;s email (optional)
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
                  Amount to send ({sendingCurrency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder={`Enter amount in ${sendingCurrency}`}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Your selected sending country's currency is used for this
                  amount preview.
                </p>
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
                    This is a preview only. No payment will be collected and
                    no money will be transferred. Available countries and
                    transfer routes will depend on an approved provider.
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
              <h2 className="text-lg font-bold">Transfer overview</h2>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Sending from</span>
                  <span className="text-right font-semibold">
                    {sendingCountry?.name} ({sendingCurrency})
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Sending amount</span>
                  <span className="text-right font-semibold">
                    {formattedAmount}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Destination</span>
                  <span className="text-right font-semibold">
                    {destinationCountry?.name}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Destination currency</span>
                  <span className="font-semibold">
                    {destinationCountry?.currency}
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
