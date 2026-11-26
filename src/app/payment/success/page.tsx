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
  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user;

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isSessionPending) return;

    let isSubscribed = true;

    async function runVerification() {
      if (sessionId) {
        try {
          await verifyVendorUpgradeSession(sessionId, user?.email || "");
          if (isSubscribed) {
            setVerified(true);
          }
        } catch (err: any) {
          if (isSubscribed) {
            setErrorMsg(err.message || "Failed to confirm upgrade with server");
          }
        } finally {
          if (isSubscribed) {
            setVerifying(false);
          }
        }
      } else {
        if (isSubscribed) {
          setVerifying(false);
          setVerified(true);
        }
      }
    }

    runVerification();

    return () => {
      isSubscribed = false;
    };
  }, [sessionId, user?.email, isSessionPending]);

  if (verifying || isSessionPending) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#8E1616] dark:text-[#E25C5C]" />
        <p className="text-sm font-bold text-[#6E5F5B] dark:text-zinc-400">Verifying Stripe transaction &amp; elevating kitchen status...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-[#1A1110] rounded-3xl p-8 sm:p-12 border border-red-200 dark:border-red-900/40 shadow-xl text-center space-y-6 my-12">
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-red-600 dark:text-red-400">
            Upgrade Verification Failed
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5F5B] dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
            {errorMsg}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setVerifying(true);
              setErrorMsg("");
              if (sessionId) {
                verifyVendorUpgradeSession(sessionId, user?.email || "")
                  .then(() => setVerified(true))
                  .catch((err: any) => setErrorMsg(err.message || "Failed to verify"))
                  .finally(() => setVerifying(false));
              }
            }}
            className="py-3 px-5 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-black transition cursor-pointer"
          >
            Retry Verification
          </button>
          <Link
            href="/vendor/upgrade"
            className="py-3 px-5 rounded-2xl border border-[#EBE4D8] dark:border-[#2D1E1B] text-xs font-bold text-[#190F0E] dark:text-white transition cursor-pointer"
          >
            Return to Upgrade Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-[#1A1110] rounded-3xl p-8 sm:p-12 border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-xl text-center space-y-6 my-12">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
        <Crown className="w-10 h-10 fill-amber-500 dark:fill-amber-400" />
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/40">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Payment Verified &amp; Confirmed</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] dark:text-white">
          Welcome to Master Baker Tier!
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5F5B] dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
          Your vendor subscription has been activated. Your restaurant profile now enjoys unlimited artisan menu publishing, gold crown status, and featured placement across PizzaHub.
        </p>
      </div>

      {sessionId && (
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#251715] border border-[#EBE4D8] dark:border-[#3D2825] text-xs space-y-1 text-left">
          <div className="text-[10px] font-bold uppercase text-[#6E5F5B] dark:text-zinc-400 tracking-wider">
            Stripe Transaction ID
          </div>
          <div className="font-mono text-[11px] text-[#190F0E] dark:text-white truncate">
            {sessionId}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <Link
          href="/vendor/dashboard"
          className="py-3.5 px-4 rounded-2xl bg-[#190F0E] dark:bg-[#2D1E1B] hover:bg-black dark:hover:bg-[#3D2825] text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-16 px-4">
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
