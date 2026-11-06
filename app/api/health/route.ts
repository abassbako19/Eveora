
import { NextResponse } from "next/server";
export async function GET() {
 return NextResponse.json({
  ok:true,app:"eveora",
  databaseConfigured:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  paymentsConfigured:Boolean(process.env.PAYSTACK_SECRET_KEY),
  paymentMode:process.env.PAYSTACK_MODE==="test"?"test":"disabled"
 });
}
