import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Brand } from "@/components/brand";
import { HeartHandshake, Target } from "lucide-react";
import { formatCurrency, type EveoraCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const db = await createClient();

  const { data: campaigns } = await db
    .from("campaigns")
    .select(
      "id,title,slug,summary,description,category,target_amount_kobo,target_amount_minor,currency,created_at"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  const ids = (campaigns || []).map((c) => c.id);

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const metricsDb =
    serviceUrl && serviceKey
      ? createSupabaseClient(serviceUrl, serviceKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        })
      : null;

  const { data: donations } =
    ids.length && metricsDb
      ? await metricsDb
          .from("eveora_donations")
          .select("campaign_id,amount_kobo")
          .eq("status", "paid")
          .in("campaign_id", ids)
      : {
          data: [] as {
            campaign_id: string | null;
            amount_kobo: number;
          }[],
        };

  const raised = new Map<string, number>();

  for (const d of donations || []) {
    if (d.campaign_id) {
      raised.set(
        d.campaign_id,
        (raised.get(d.campaign_id) || 0) + Number(d.amount_kobo)
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Brand />
          <Link
            href="/donate"
            className="rounded-xl bg-eveora-blue px-4 py-2 text-sm font-semibold text-white"
          >
            Donate
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-eveora-blue">
          Community campaigns
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-eveora-ink">
          Causes moving people forward.
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
          Explore active campaigns published by Eveora administrators.
          Campaign targets are published by administrators. Donations are
          processed through secure checkout.
        </p>

        {campaigns?.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((c) => {
              const currency = (c.currency || "NGN") as EveoraCurrency;
              const targetMinor = Number(
                c.target_amount_minor ?? c.target_amount_kobo ?? 0
              );
              const targetAmount = targetMinor / 100;
              const amountRaised = (raised.get(c.id) || 0) / 100;
              const isNairaCampaign = currency === "NGN";
              const hasTarget = targetAmount > 0;

              const progress = isNairaCampaign && hasTarget
                ? Math.min(
                    100,
                    Math.round(
                      ((raised.get(c.id) || 0) / targetMinor) * 100
                    )
                  )
                : 0;

              return (
                <article
                  key={c.id}
                  className="campaign-card rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <span className="rounded-full bg-eveora-sky px-3 py-1 text-xs font-semibold text-eveora-blue">
                    {c.category}
                  </span>

                  <h2 className="mt-5 text-2xl font-bold text-eveora-ink">
                    {c.title}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {c.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <strong className="text-slate-900">
                      {formatCurrency(amountRaised, "NGN")} raised
                    </strong>

                    {hasTarget && (
                      <span className="text-slate-500">
                        Target: {formatCurrency(targetAmount, currency)}
                      </span>
                    )}
                  </div>

                  {isNairaCampaign && hasTarget && (
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-eveora-blue"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {!isNairaCampaign && hasTarget && (
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Target is displayed in {currency}. Donations are
                      recorded in NGN, so campaign progress is not compared
                      across currencies.
                    </p>
                  )}

                  <Link
                    href={`/campaigns/${c.slug}`}
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-eveora-blue px-5 py-3 text-sm font-bold text-white"
                  >
                    <HeartHandshake size={17} />
                    Support campaign
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Target className="mx-auto text-slate-400" size={34} />
            <h2 className="mt-4 text-xl font-bold text-slate-800">
              No active campaigns yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Our team is preparing the first campaigns. You can still make a
              general donation.
            </p>
            <Link
              href="/donate"
              className="mt-5 inline-flex rounded-xl bg-eveora-blue px-5 py-3 text-sm font-semibold text-white"
            >
              Make a general donation
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
