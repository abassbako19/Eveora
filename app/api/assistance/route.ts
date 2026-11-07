import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isEveoraCurrency } from "@/lib/currency";

type AssistanceDocumentInsert = {
  request_id: string;
  user_id: string;
  storage_path: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
};

type AssistanceStorageDatabase = {
  public: {
    Tables: {
      assistance_documents: {
        Row: AssistanceDocumentInsert & {
          id: string;
          created_at: string;
        };
        Insert: AssistanceDocumentInsert;
        Update: Partial<AssistanceDocumentInsert>;
        Relationships: [];
      };
      assistance_requests: {
        Row: {
          id: string;
          user_id: string;
          reference: string;
          category: string;
          country: string;
          requested_amount: number | null;
          currency: string;
          summary: string;
          details: string;
          status: string;
          admin_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reference: string;
          category: string;
          country: string;
          requested_amount?: number | null;
          currency?: string;
          summary: string;
          details: string;
          status?: string;
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export const runtime = "nodejs";

const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

function matchesFileSignature(type: string, bytes: Buffer) {
  if (type === "application/pdf") {
    return bytes.subarray(0, 5).toString() === "%PDF-";
  }

  if (type === "image/jpeg") {
    return (
      bytes.length > 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (type === "image/png") {
    return bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }

  return false;
}

export async function POST(request: Request) {
  let requestId: string | undefined;
  let uploaded: string[] = [];
  let admin:
    | ReturnType<typeof createSupabaseClient<AssistanceStorageDatabase>>
    | undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      );
    }

    const form = await request.formData();

    const category = String(form.get("category") || "").slice(0, 60);
    const country = String(form.get("country") || "").trim().slice(0, 80);
    const summary = String(form.get("summary") || "").trim().slice(0, 120);
    const details = String(form.get("details") || "").trim().slice(0, 4000);
    const rawAmount = String(form.get("amount") || "");
    const amount = rawAmount === "" ? null : Number(rawAmount);
    const currency = String(form.get("currency") || "NGN");

    const allowed = [
      "Essential bills",
      "Food and basic needs",
      "Education",
      "Medical support",
      "Emergency support",
      "Housing",
      "Other",
    ];

    const validAmount =
      amount === null ||
      (
        Number.isFinite(amount) &&
        amount >= 0 &&
        amount <= 100000000 &&
        Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-7
      );

    if (
      !allowed.includes(category) ||
      !country ||
      summary.length < 5 ||
      details.length < 20 ||
      !isEveoraCurrency(currency) ||
      !validAmount
    ) {
      return NextResponse.json(
        { error: "Please complete the form with valid details." },
        { status: 400 }
      );
    }

    const files = form
      .getAll("documents")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length > 3) {
      return NextResponse.json(
        { error: "You can attach up to 3 documents." },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!allowedTypes.has(file.type) || file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            error:
              "Attachments must be PDF, JPG or PNG files, each no larger than 5 MB.",
          },
          { status: 400 }
        );
      }

      const bytes = Buffer.from(await file.arrayBuffer());

      if (!matchesFileSignature(file.type, bytes)) {
        return NextResponse.json(
          {
            error: `${file.name} does not appear to be a valid PDF, JPG or PNG file.`,
          },
          { status: 400 }
        );
      }
    }

    if (files.length) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!url || !key) {
        return NextResponse.json(
          {
            error:
              "Secure document storage is not configured. Please contact support or submit without attachments.",
          },
          { status: 503 }
        );
      }

      admin = createSupabaseClient<AssistanceStorageDatabase>(
        url,
        key,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );
    }

    const reference = `EVA-${randomUUID()
      .replaceAll("-", "")
      .slice(0, 20)
      .toUpperCase()}`;

    const { data: row, error } = await supabase
      .from("assistance_requests")
      .insert({
        user_id: user.id,
        reference,
        category,
        country,
        requested_amount: amount,
        currency,
        summary,
        details,
        status: "submitted",
      })
      .select("id")
      .single();

    if (error || !row) {
      return NextResponse.json(
        {
          error:
            "We could not save your request. Please try again later.",
        },
        { status: 500 }
      );
    }

    requestId = row.id;

    for (const file of files) {
      const ext =
        file.type === "application/pdf"
          ? "pdf"
          : file.type === "image/jpeg"
            ? "jpg"
            : "png";

      const path = `${user.id}/${row.id}/${randomUUID()}.${ext}`;
      const bytes = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await admin!
        .storage
        .from("eveora-assistance-private")
        .upload(path, bytes, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error("A document could not be securely uploaded.");
      }

      uploaded.push(path);

      const { error: metaError } = await admin!
        .from("assistance_documents")
        .insert({
          request_id: row.id,
          user_id: user.id,
          storage_path: path,
          original_name: file.name.slice(0, 180),
          content_type: file.type,
          size_bytes: file.size,
        });

      if (metaError) {
        throw new Error("Could not save document details.");
      }
    }

    return NextResponse.json({
      ok: true,
      id: row.id,
      reference,
      documents: uploaded.length,
    });
  } catch (error) {
    if (admin && requestId) {
      if (uploaded.length) {
        await admin.storage
          .from("eveora-assistance-private")
          .remove(uploaded);
      }

      await admin
        .from("assistance_requests")
        .delete()
        .eq("id", requestId);
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit your request right now.",
      },
      { status: 500 }
    );
  }
}
