"use client";
import { Printer } from "lucide-react";
export function ReceiptPrintButton(){return <button onClick={()=>window.print()} className="inline-flex items-center gap-2 rounded-xl bg-eveora-blue px-4 py-2.5 text-sm font-semibold text-white"><Printer size={16}/> Print / Save PDF</button>}
