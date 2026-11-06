import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (
    !secret ||
    !secret.startsWith("sk_test_") ||
    process.env.PAYSTACK_MODE !== "test" ||
    !serviceKey ||
    !url
  ) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";

  if (!/^[a-f0-9]{128}$/i.test(signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const expected = createHmac("sha512", secret)
    .update(raw)
    .digest("hex");

  const suppliedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(raw);

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const ref = String(event.data?.reference || "");
    const eventAmount = Number(event.data?.amount);
    const eventCurrency = String(event.data?.currency || "");
    const eventTransactionId = Number(event.data?.id);

    if (
      !ref ||
      ref.length > 80 ||
      !Number.isSafeInteger(eventAmount) ||
      !Number.isSafeInteger(eventTransactionId)
    ) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const admin = createSupabaseClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: row, error: lookupError } = await admin
      .from("donations")
      .select("id,amount_kobo,currency,status")
      .eq("reference", ref)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json(
        { error: "Could not check donation" },
        { status: 500 }
      );
    }

    if (!row) {
      return NextResponse.json({ received: true });
    }

    if (
      eventAmount !== row.amount_kobo ||
      eventCurrency !== row.currency
    ) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Independently verify the transaction directly with Paystack.
    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        cache: "no-store",
      }
    );

    if (!verificationResponse.ok) {
      return NextResponse.json(
        { error: "Paystack verification temporarily unavailable" },
        { status: 502 }
      );
    }

    const verification = await verificationResponse.json();
    const transaction = verification.data;

    if (
      !verification.status ||
      transaction?.status !== "success" ||
      transaction?.reference !== ref ||
      Number(transaction?.amount) !== row.amount_kobo ||
      transaction?.currency !== row.currency ||
      Number(transaction?.id) !== eventTransactionId
    ) {
      return NextResponse.json(
        { error: "Paystack transaction verification failed" },
        { status: 400 }
      );
    }

    // The database function is idempotent and awards Credits once.
    if (row.status !== "paid") {
      const { error: confirmError } = await admin.rpc(
        "eveora_confirm_donation",
        {
          p_reference: ref,
          p_transaction_id: String(transaction.id),
        }
      );

      if (confirmError) {
        return NextResponse.json(
          { error: "Could not finalize verified donation" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
