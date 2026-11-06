import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
export const runtime="nodejs";
export async function POST(request:Request){
 const session=await createClient();const {data:{user}}=await session.auth.getUser();if(!user?.email)return NextResponse.json({error:"Sign in first."},{status:401});
 const admins=(process.env.ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);if(!admins.includes(user.email.toLowerCase()))return NextResponse.json({error:"Administrator access required."},{status:403});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return NextResponse.json({error:"Admin server configuration is missing."},{status:503});
 try{const b=await request.json();const userId=String(b.userId||""),reason=String(b.reason||"").trim().slice(0,500),points=Number(b.points);if(!/^[0-9a-f-]{36}$/i.test(userId)||!Number.isSafeInteger(points)||points<1||points>5000||reason.length<8)return NextResponse.json({error:"Enter a valid recipient user UUID, 1–5,000 points and a documented reason."},{status:400});const db=createSupabaseClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const {data:target,error:lookupError}=await db.auth.admin.getUserById(userId);if(lookupError||!target.user)return NextResponse.json({error:"That user account was not found."},{status:404});const {error}=await db.from("impact_points_ledger").insert({user_id:userId,points,reason,created_by:user.id,source_key:"admin_verified_award"});if(error)return NextResponse.json({error:"Could not record the award. Apply the v1.3 database migration first."},{status:500});return NextResponse.json({ok:true});}catch{return NextResponse.json({error:"Invalid award details."},{status:400});}
}
