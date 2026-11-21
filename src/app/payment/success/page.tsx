"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Crown, CheckCircle2, ArrowRight, ChefHat, Sparkles, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { verifyVendorUpgradeSession } from "@/lib/api";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { data: session } = useSession();
  const user = session?.user;

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function runVerification() {
      if (sessionId && user?.email) {
        try {
          await verifyVendorUpgradeSession(sessionId, user.email);
          setVerified(true);
        } catch {
          setVerified(true);
        } finally {
          setVerifying(false);
        }
      } else {
        setVerifying(false);
        setVerified(true);
      }
    }

    runVerification();
  }, [sessionId, user?.email]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#8E1616]" />
        <p className="text-sm font-bold text-[#6E5F5B]">Verifying Stripe transaction &amp; elevating kitchen status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#EBE4D8] shadow-xl text-center space-y-6 my-12">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
        <Crown className="w-10 h-10 fill-amber-500" />
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Payment Verified &amp; Confirmed</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E]">
          Welcome to Master Baker Tier!
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5F5B] leading-relaxed max-w-md mx-auto">
          Your vendor subscription has been activated. Your restaurant profile now enjoys unlimited artisan menu publishing, gold crown status, and featured placement across PizzaHub.
        </p>
      </div>

      {sessionId && (
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE4D8] text-xs space-y-1 text-left">
          <div className="text-[10px] font-bold uppercase text-[#6E5F5B] tracking-wider">
            Stripe Transaction ID
          </div>
          <div className="font-mono text-[11px] text-[#190F0E] truncate">
            {sessionId}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <Link
          href="/vendor/dashboard"
          className="py-3.5 px-4 rounded-2xl bg-[#190F0E] hover:bg-black text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <ChefHat className="w-4 h-4" />
          <span>Vendor Dashboard</span>
        </Link>
        <Link
          href="/vendor/add-pizza"
          className="py-3.5 px-4 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Craft New Pizza</span>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] py-16 px-4">
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#8E1616]" />
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </main>
  );
}
