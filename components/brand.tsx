import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-bold tracking-tight ${light ? "text-white" : "text-eveora-ink"}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-eveora-blue text-white shadow-sm">
        <Sparkles size={19} />
      </span>
      <span className="text-xl">eveora<span className="text-eveora-blue">.</span></span>
    </Link>
  );
}
