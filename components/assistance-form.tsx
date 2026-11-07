"use client";

import { useState } from "react";
import { EVEORA_CURRENCIES, CURRENCY_LABELS } from "@/lib/currency";

export function AssistanceForm() {
  const [form, setForm] = useState({
    category: "Essential bills",
    country: "Nigeria",
    amount: "",
    currency: "NGN",
    summary: "",
    details: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [documents, setDocuments] = useState<FileList | null>(null);

  function change(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setDone("");

    try {
      const payload = new FormData();
      (Object.entries(form) as [string, string][]).forEach(([key, value]) =>
        payload.append(key, value)
      );

      if (documents) {
        Array.from(documents).forEach((file) =>
          payload.append("documents", file)
        );
      }

      const r = await fetch("/api/assistance", {
        method: "POST",
        body: payload,
      });
      const d = await r.json();

      if (!r.ok) throw new Error(d.error || "Could not submit request.");

      setDone(
        `Your request has been submitted. Reference: ${d.reference}. ${
          d.documents || 0
        } supporting document(s) uploaded securely. ${d.warning || ""}`
      );
      setForm((f) => ({ ...f, amount: "", summary: "", details: "" }));
      setDocuments(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "auth-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none";

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Type of assistance
        </label>
        <select
          value={form.category}
          onChange={(e) => change("category", e.target.value)}
          className={field}
        >
          <option>Essential bills</option>
          <option>Food and basic needs</option>
          <option>Education</option>
          <option>Medical support</option>
          <option>Emergency support</option>
          <option>Housing</option>
          <option>Other</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Country
          </label>
          <input
            required
            maxLength={80}
            value={form.country}
            onChange={(e) => change("country", e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Amount requested (optional)
          </label>
          <input
            type="number"
            min="0"
            max="100000000"
            step="0.01"
            value={form.amount}
            onChange={(e) => change("amount", e.target.value)}
            placeholder={`Amount in ${form.currency}`}
            className={field}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Currency
        </label>
        <select
          value={form.currency}
          onChange={(e) => change("currency", e.target.value)}
          className={field}
        >
          {EVEORA_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {CURRENCY_LABELS[currency]}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">
          The amount is recorded in your selected currency. No currency
          conversion or funding guarantee is implied.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Short title
        </label>
        <input
          required
          minLength={5}
          maxLength={120}
          value={form.summary}
          onChange={(e) => change("summary", e.target.value)}
          placeholder="Briefly describe what you need help with"
          className={field}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Explain your situation
        </label>
        <textarea
          required
          minLength={20}
          maxLength={4000}
          rows={6}
          value={form.details}
          onChange={(e) => change("details", e.target.value)}
          placeholder="Share relevant details. Do not include passwords, card details or unnecessary sensitive information."
          className={field}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Supporting documents (optional)
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          multiple
          onChange={(e) => setDocuments(e.target.files)}
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-800"
        />
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Up to 3 files, PDF/JPG/PNG only, maximum 5 MB each. Files are private
          and only you and authorized administrators can access them.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {done && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {done}
        </p>
      )}

      <button
        disabled={busy}
        className="w-full rounded-xl bg-eveora-blue px-5 py-4 font-bold text-white disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Submit assistance request"}
      </button>

      <p className="text-xs leading-5 text-slate-500">
        Submitting a request does not guarantee assistance or approval. Requests
        are subject to review. Do not upload bank-card credentials, passwords
        or unrelated sensitive information.
      </p>
    </form>
  );
}
