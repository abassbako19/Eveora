"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, Send, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";

type Message = { role: "user" | "assistant"; content: string };
export default function AssistantPage() {
  const router = useRouter(); const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hello! I'm Eveora Assistant. I can help you understand how Eveora works, describe the support you are looking for, or plan your next steps. What would you like help with today?" }]);
  const [draft, setDraft] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const content = draft.trim(); if (!content || busy) return;
    const next: Message[] = [...messages, { role: "user", content }]; setMessages(next); setDraft(""); setBusy(true); setError("");
    try { const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.slice(-10) }) }); const data = await response.json(); if (response.status === 401) { router.push("/login?next=/assistant"); return; } if (!response.ok) throw new Error(data.error || "Assistant unavailable."); setMessages([...next, { role: "assistant", content: data.answer }]); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to send your message."); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4"><Brand /><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-eveora-blue"><ArrowLeft size={16}/> Dashboard</Link></div></header>
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><div className="mb-6 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-eveora-sky text-eveora-blue"><Bot size={25}/></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-eveora-blue">Eveora support</p><h1 className="text-2xl font-bold text-eveora-ink">AI Assistant</h1></div><span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><Sparkles size={13}/> Preview</span></div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="max-h-[58vh] min-h-[360px] space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">{messages.map((m,i)=><div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${m.role === "user" ? "bg-eveora-blue text-white" : "bg-slate-100 text-slate-700"}`}>{m.content}</div></div>)}{busy && <div className="inline-flex animate-pulse rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">Eveora Assistant is thinking…</div>}</div>
      <form onSubmit={send} className="border-t border-slate-100 p-3 sm:p-4"><div className="flex items-end gap-2"><textarea value={draft} onChange={e=>setDraft(e.target.value)} maxLength={2500} rows={2} placeholder="Tell Eveora what you need help with…" className="max-h-36 min-h-[52px] flex-1 resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-eveora-blue focus:ring-4 focus:ring-blue-100"/><button disabled={busy || !draft.trim()} aria-label="Send message" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-eveora-blue text-white transition hover:bg-blue-700 disabled:opacity-50"><Send size={18}/></button></div>{error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}<p className="mt-3 text-xs leading-5 text-slate-400">AI can make mistakes. Do not share passwords, payment details or sensitive identity numbers. Eveora Assistant cannot approve aid or guarantee support.</p></form></div>
    </section></main>;
}
