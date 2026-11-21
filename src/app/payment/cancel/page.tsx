"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw, Store } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] py-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#EBE4D8] shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto text-2xl font-black">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#190F0E]">
            Payment Cancelled
          </h1>
          <p className="text-xs text-[#6E5F5B] leading-relaxed">
            Your Stripe checkout session was cancelled and no charges were made. Your kitchen remains on the current tier.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            href="/vendor/upgrade"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Upgrading Again</span>
          </Link>
          <Link
            href="/vendor/dashboard"
            className="w-full py-3 px-4 rounded-2xl bg-[#FAF7F2] hover:bg-stone-200 border border-[#EBE4D8] text-[#190F0E] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vendor Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
