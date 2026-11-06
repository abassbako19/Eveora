
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
export const runtime="nodejs";
export async function PATCH(request:Request){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user?.email)return NextResponse.json({error:"Unauthorized"},{status:401});
 const admins=(process.env.ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase());
 if(!admins.includes(user.email.toLowerCase()))return NextResponse.json({error:"Forbidden"},{status:403});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return NextResponse.json({error:"Admin database access is not configured."},{status:503});
 const b=await request.json();const statuses=["submitted","under_review","approved","declined","closed"];
 if(typeof b.id!=="string"||!statuses.includes(b.status))return NextResponse.json({error:"Invalid request."},{status:400});
 const admin=createSupabaseClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {error}=await admin.from("assistance_requests").update({status:b.status,updated_at:new Date().toISOString()}).eq("id",b.id);
 if(error)return NextResponse.json({error:"Could not update request."},{status:500});
 return NextResponse.json({ok:true});
}
