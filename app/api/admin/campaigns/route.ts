import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isEveoraCurrency, toMinorUnits } from "@/lib/currency";

export const runtime = "nodejs";

async function adminContext() {
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();

  if (!user?.email) {
    return {
      error: NextResponse.json(
        { error: "Sign in first." },
        { status: 401 }
      ),
    };
  }

  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.includes(user.email.toLowerCase())) {
    return {
      error: NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      ),
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return {
      error: NextResponse.json(
        { error: "Admin server configuration is missing." },
        { status: 503 }
      ),
    };
  }

  return {
    user,
    db: createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
  };
}

export async function POST(request: Request) {
  const ctx = await adminContext();

  if ("error" in ctx) return ctx.error;

  try {
    const b = await request.json();

    const title = String(b.title || "").trim().slice(0, 120);
    const slug = String(b.slug || "").trim().toLowerCase().slice(0, 120);
    const summary = String(b.summary || "").trim().slice(0, 220);
    const description = String(b.description || "").trim().slice(0, 10000);
    const category = String(b.category || "Community support")
      .trim()
      .slice(0, 80);

    const rawTarget = b.targetAmount;
    const target =
      rawTarget === "" || rawTarget === null || rawTarget === undefined
        ? null
        : Number(rawTarget);

    const currency = String(b.currency || "NGN");

    const validTarget =
      target === null ||
      (
        Number.isFinite(target) &&
        target >= 0.01 &&
        target <= 1000000000 &&
        Math.abs(target * 100 - Math.round(target * 100)) < 1e-7
      );

    if (
      title.length < 4 ||
      summary.length < 10 ||
      description.length < 20 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      !isEveoraCurrency(currency) ||
      !validTarget
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid title, URL slug, summary, description, currency and target.",
        },
        { status: 400 }
      );
    }

    const targetMinor =
      target === null ? null : toMinorUnits(target);

    const { data, error } = await ctx.db
      .from("campaigns")
      .insert({
        title,
        slug,
        summary,
        description,
        category,
        currency,
        target_amount_minor: targetMinor,
        target_amount_kobo:
          targetMinor === null || currency !== "NGN"
            ? null
            : targetMinor,
        status: "draft",
        created_by: ctx.user.id,
      })
      .select("id,title,slug,status")
      .single();

    if (error) {
      console.error("Campaign creation error:", error);

      return NextResponse.json(
        {
          error:
            error.code === "23505"
              ? "That campaign URL already exists."
              : "Could not create campaign.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, campaign: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid campaign details." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const ctx = await adminContext();

  if ("error" in ctx) return ctx.error;

  try {
    const b = await request.json();

    if (
      typeof b.id !== "string" ||
      !["draft", "active", "paused", "completed"].includes(b.status)
    ) {
      return NextResponse.json(
        { error: "Invalid campaign update." },
        { status: 400 }
      );
    }

    const { error } = await ctx.db
      .from("campaigns")
      .update({
        status: b.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", b.id);

    if (error) {
      return NextResponse.json(
        { error: "Could not update campaign." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid campaign update." },
      { status: 400 }
    );
  }
}
