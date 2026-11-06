
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export default async function VerifyDonation({searchParams}:{searchParams:Promise<{reference?:string}>}) {
 const {reference}=await searchParams;const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 if(!reference||reference.length>80)return <Result ok={false} title="Missing payment reference" detail="We could not identify this payment." />;
 const {data:donation}=await supabase.from("eveora_donations").select("id,status,amount_kobo,currency").eq("reference",reference).eq("user_id",user.id).maybeSingle();
 if(!donation)return <Result ok={false} title="Donation not found" detail="This payment reference is not linked to your account." />;
 if(donation.status==="paid")return <Result ok title="Donation confirmed" detail={`Your test donation of ₦${(donation.amount_kobo/100).toLocaleString("en-NG")} was verified.`} reference={reference}/>;
 const secret=process.env.PAYSTACK_SECRET_KEY;
 const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
 if(!secret||!secret.startsWith("sk_test_")||process.env.PAYSTACK_MODE!=="test"||!serviceKey||!supabaseUrl)return <Result ok={false} title="Verification unavailable" detail="Payment verification is not configured. Please contact support with your reference."/>;
 try {
  const r=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,{headers:{Authorization:`Bearer ${secret}`},cache:"no-store"});
  const result=await r.json();
  if(r.ok&&result.status&&result.data?.status==="success"&&result.data?.reference===reference&&Number(result.data?.amount)===donation.amount_kobo&&result.data?.currency===donation.currency){
   const admin=createSupabaseClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
   const {error:confirmError}=await admin.rpc("eveora_confirm_donation",{p_reference:reference,p_transaction_id:String(result.data.id)});
   if(confirmError)throw new Error("Donation finalization failed");
   return <Result ok title="Donation confirmed" detail={`Your test donation of ₦${(donation.amount_kobo/100).toLocaleString("en-NG")} was verified. No live funds were collected in test mode.`} reference={reference}/>;
  }
  if(result.data?.status==="failed"||result.data?.status==="abandoned"){
   const admin=createSupabaseClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
   await admin.from("eveora_donations").update({status:"failed"}).eq("id",donation.id);
  }
  return <Result ok={false} title="Payment not confirmed" detail="Paystack did not report a successful payment. You can return to donations and try again." />;
 }catch{return <Result ok={false} title="Could not verify yet" detail="The payment provider could not be reached. Your donation remains pending; retry by refreshing this page."/>;}
}
function Result({ok,title,detail,reference}:{ok:boolean,title:string,detail:string,reference?:string}){return <main className="grid min-h-screen place-items-center bg-slate-50 px-5"><div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">{ok?<CheckCircle2 className="mx-auto text-emerald-600" size={48}/>:<XCircle className="mx-auto text-rose-600" size={48}/>}<h1 className="mt-5 text-2xl font-bold text-eveora-ink">{title}</h1><p className="mt-3 leading-7 text-slate-600">{detail}</p>{ok&&reference&&<Link href={`/receipt/${encodeURIComponent(reference)}`} className="mt-7 mr-2 inline-flex rounded-xl border border-eveora-blue px-6 py-3 font-semibold text-eveora-blue">View donation receipt</Link>}<Link href="/dashboard" className="mt-7 inline-flex rounded-xl bg-eveora-blue px-6 py-3 font-semibold text-white">Go to dashboard</Link></div></main>}
