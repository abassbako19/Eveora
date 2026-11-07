"use client";

import { useState } from "react";
import { EVEORA_CURRENCIES, CURRENCY_LABELS } from "@/lib/currency";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  status: string;
  summary: string;
};

const initialForm = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  category: "Community support",
  targetAmount: "",
  currency: "NGN",
};

export function CampaignAdmin({
  campaigns,
}: {
  campaigns: Campaign[];
}) {
  const [items, setItems] = useState(campaigns);
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const r = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not create campaign");

      setItems((x) => [
        { ...d.campaign, summary: form.summary },
        ...x,
      ]);
      setForm(initialForm);
      setMessage("Campaign saved as draft. Activate it when ready.");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not save campaign"
      );
    } finally {
      setBusy(false);
    }
  }

  async function status(id: string, value: string) {
    setMessage("");

    try {
      const r = await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: value }),
      });

      const d = await r.json();
      if (!r.ok) {
        setMessage(d.error || "Update failed");
        return;
      }

      setItems((xs) =>
        xs.map((x) => (x.id === id ? { ...x, status: value } : x))
      );
    } catch {
      setMessage("Could not update campaign status.");
    }
  }

  const field =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-eveora-blue";

  return (
    <div className="space-y-7">
      <form
        onSubmit={create}
        className="grid gap-3 rounded-2xl bg-slate-50 p-5 md:grid-cols-2"
      >
        <h3 className="text-lg font-bold md:col-span-2">
          Create a campaign
        </h3>

        <input
          required
          minLength={4}
          maxLength={120}
          placeholder="Campaign title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={field}
        />

        <input
          required
          placeholder="url-slug-like-this"
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          className={field}
        />

        <input
          required
          minLength={10}
          maxLength={220}
          placeholder="Short campaign summary"
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          className={field}
        />

        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className={field}
        />

        <input
          type="number"
          min="0.01"
          max="1000000000"
          step="0.01"
          placeholder={`Target amount in ${form.currency} (optional)`}
          value={form.targetAmount}
          onChange={(e) => set("targetAmount", e.target.value)}
          className={field}
        />

        <select
          aria-label="Campaign target currency"
          value={form.currency}
          onChange={(e) => set("currency", e.target.value)}
          className={field}
        >
          {EVEORA_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {CURRENCY_LABELS[currency]}
            </option>
          ))}
        </select>

        <p className="text-xs leading-5 text-slate-500 md:col-span-2">
          The target is recorded in the selected currency. No exchange-rate
          conversion is applied. Donations and Paystack payments remain
          NGN-only.
        </p>

        <textarea
          required
          minLength={20}
          rows={3}
          placeholder="Full campaign description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={`${field} md:col-span-2`}
        />

        <button
          disabled={busy}
          className="rounded-xl bg-eveora-blue px-5 py-3 text-sm font-bold text-white disabled:opacity-50 md:col-span-2"
        >
          {busy ? "Saving…" : "Create draft campaign"}
        </button>

        {message && (
          <p role="status" className="text-sm text-slate-600 md:col-span-2">
            {message}
          </p>
        )}
      </form>

      <div className="space-y-3">
        {items.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4"
          >
            <div>
              <p className="font-bold text-slate-900">{c.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                /campaigns · {c.slug} · {c.status}
              </p>
            </div>

            <select
              aria-label={`Status for ${c.title}`}
              value={c.status}
              onChange={(e) => status(c.id, e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        ))}

        {!items.length && (
          <p className="text-sm text-slate-500">No campaigns yet.</p>
        )}
      </div>
    </div>
  );
}
