import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
export const runtime="nodejs";
export async function POST(request:Request){
 const session=await createClient();const {data:{user}}=await session.auth.getUser();if(!user?.email)return NextResponse.json({error:"Sign in first."},{status:401});
 const admins=(process.env.ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);if(!admins.includes(user.email.toLowerCase()))return NextResponse.json({error:"Administrator access required."},{status:403});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return NextResponse.json({error:"Admin server configuration is missing."},{status:503});
 try{const b=await request.json();const title=String(b.title||"").trim().slice(0,100),description=String(b.description||"").trim().slice(0,500),points=Number(b.points);if(title.length<4||description.length<12||!Number.isSafeInteger(points)||points<1||points>100000)return NextResponse.json({error:"Enter a title, a clear description and a point value between 1 and 100,000."},{status:400});const ruleKey=title.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"").slice(0,80);const db=createSupabaseClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const {data,error}=await db.from("impact_point_rules").insert({rule_key:ruleKey,title,description,points,enabled:false,requires_verification:b.requiresVerification!==false}).select("id,rule_key,title,description,points,enabled,requires_verification").single();if(error)return NextResponse.json({error:error.code==="23505"?"A rule with a similar name already exists.":"Could not save this draft rule."},{status:500});return NextResponse.json({ok:true,rule:data});}catch{return NextResponse.json({error:"Invalid rule details."},{status:400});}
}
