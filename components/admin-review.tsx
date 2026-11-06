
"use client";
import { useState } from "react";
export function AdminReview({id,status}:{id:string,status:string}){
 const [value,setValue]=useState(status),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function save(){setBusy(true);setMessage("");try{const r=await fetch("/api/admin/assistance-status",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:value})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Update failed");setMessage("Saved");}catch(e){setMessage(e instanceof Error?e.message:"Update failed");}finally{setBusy(false);}}
 return <div className="flex flex-wrap items-center gap-2"><select aria-label="Request status" value={value} onChange={e=>setValue(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-800"><option value="submitted">Submitted</option><option value="under_review">Under review</option><option value="approved">Approved</option><option value="declined">Declined</option><option value="closed">Closed</option></select><button onClick={save} disabled={busy||value===status} className="rounded-lg bg-eveora-blue px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy?"Saving…":"Save"}</button>{message&&<span className="text-xs text-slate-500">{message}</span>}</div>;
}
