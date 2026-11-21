"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Flame, RefreshCw, ArrowLeft, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PizzaHub Application Exception:", error);
  }, [error]);

  return (
    <main className="min-h-[85vh] bg-[#FAF7F2] flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EBE4D8] shadow-sm p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Flame className="w-10 h-10 fill-amber-500" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Hearth Temperature Anomaly</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E]">
            Something Singed the Dough
          </h1>
          <p className="text-xs text-[#6E5F5B] leading-relaxed">
            An unexpected glitch paused this stone oven dispatch. Our master bakers have been alerted, and you can safely attempt to re-ignite the hearth.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#8E1616] hover:bg-[#721212] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-fire Kitchen Pipeline</span>
          </button>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-stone-50 hover:bg-stone-100 text-[#190F0E] font-bold text-sm border border-[#EBE4D8] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Hearth Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
