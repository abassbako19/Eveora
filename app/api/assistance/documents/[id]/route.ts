import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const session=await createClient();const {data:{user}}=await session.auth.getUser();if(!user?.email)return NextResponse.json({error:"Sign in first."},{status:401});
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Not found."},{status:404});
 const admins=(process.env.ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);const isAdmin=admins.includes(user.email.toLowerCase());
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return NextResponse.json({error:"Storage is not configured."},{status:503});
 const db=createSupabaseClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const {data:doc}=await db.from("assistance_documents").select("id,user_id,storage_path,original_name").eq("id",id).maybeSingle();if(!doc||(doc.user_id!==user.id&&!isAdmin))return NextResponse.json({error:"Document not found."},{status:404});
 const {data,error}=await db.storage.from("eveora-assistance-private").createSignedUrl(doc.storage_path,60,{download:doc.original_name});if(error||!data?.signedUrl)return NextResponse.json({error:"Could not create a secure download link."},{status:500});return NextResponse.redirect(data.signedUrl);
}
