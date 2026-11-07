import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Brand } from "@/components/brand";
import { HeartHandshake, ArrowLeft, Target } from "lucide-react";
import { formatCurrency, type EveoraCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await createClient();

  const { data: campaign } = await session
    .from("campaigns")
    .select(
      "id,title,slug,summary,description,category,target_amount_kobo,target_amount_minor,currency,created_at"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!campaign) notFound();

  let raised = 0;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    const admin = createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data } = await admin
      .from("eveora_donations")
      .select("amount_kobo")
      .eq("campaign_id", campaign.id)
      .eq("status", "paid");

    raised = (data || []).reduce(
      (sum, row) => sum + Number(row.amount_kobo),
      0
    );
  }

  const currency = (campaign.currency || "NGN") as EveoraCurrency;

  const targetMinor = Number(
    campaign.target_amount_minor ?? campaign.target_amount_kobo ?? 0
  );

  const target = targetMinor / 100;
  const isNairaCampaign = currency === "NGN";
  const hasTarget = target > 0;

  const pct =
    isNairaCampaign && hasTarget
      ? Math.min(100, Math.round((raised / targetMinor) * 100))
      : 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Brand />
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-sm font-semibold text-eveora-blue"
          >
            <ArrowLeft size={16} />
            All campaigns
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-soft sm:p-10">
          <span className="rounded-full bg-eveora-sky px-3 py-1 text-xs font-semibold text-eveora-blue">
            {campaign.category}
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-eveora-ink">
            {campaign.title}
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            {campaign.summary}
          </p>

          <div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap leading-8 text-slate-700">
            {campaign.description}
          </div>
        </article>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
          <Target className="text-eveora-blue" size={28} />

          <h2 className="mt-4 text-xl font-bold text-eveora-ink">
            Campaign progress
          </h2>

          <p className="mt-5 text-3xl font-bold text-eveora-blue">
            {formatCurrency(raised / 100, "NGN")}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            verified donations raised
          </p>

          {hasTarget && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-700">
                Campaign target: {formatCurrency(target, currency)}
              </p>

              {isNairaCampaign ? (
                <>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-eveora-blue"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {pct}% of {formatCurrency(target, currency)} target
                  </p>
                </>
              ) : (
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  This target is displayed in {currency}. Donations are
                  recorded in NGN, so progress is not compared across
                  currencies. No currency conversion is performed.
                </p>
              )}
            </div>
          )}

          <Link
            href={`/donate?campaign=${campaign.id}`}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-eveora-blue px-5 py-4 font-bold text-white"
          >
            <HeartHandshake size={18} />
            Donate to this campaign
          </Link>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Donations are processed through Paystack test mode in this
            release. No real funds are collected.
          </p>
        </aside>
      </section>
    </main>
  );
}
