"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Crown,
  Check,
  Sparkles,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  UtensilsCrossed,
  Flame,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import {
  getVendorStats,
  createCheckoutSession,
  verifyVendorUpgradeSession,
  type VendorStats,
} from "@/lib/api";

function UpgradeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user;

  const [stats, setStats] = useState<VendorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [hasVerifiedSession, setHasVerifiedSession] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await getVendorStats(user.email);
      setStats(data);
    } catch {
      setStats({
        subscriptionTier: "free",
        itemCount: 0,
        itemLimit: 3,
        canAddMore: true,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchStats();
    } else if (!isSessionPending) {
      setIsLoading(false);
    }
  }, [user?.email, isSessionPending, fetchStats]);

  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    const cancelled = searchParams.get("cancelled");

    if (cancelled === "true") {
      toast.error("Checkout was cancelled. Your kitchen remains on the Free tier.");
      router.replace("/vendor/upgrade");
      return;
    }

    if (success === "true" && sessionId && user?.email && !hasVerifiedSession) {
      setHasVerifiedSession(true);
      const verify = async () => {
        try {
          await verifyVendorUpgradeSession(sessionId, user.email);
          toast.success(
            "Welcome to PizzaHub Premium! Your kitchen now has unlimited pizza slots and gold crown status."
          );
          await fetchStats();
        } catch {
          toast.error("Could not automatically verify session. Please contact kitchen support.");
        } finally {
          router.replace("/vendor/upgrade");
        }
      };
      verify();
    }
  }, [searchParams, user?.email, hasVerifiedSession, router, fetchStats]);

  const handleUpgrade = async () => {
    if (!user?.email) {
      toast.error("Please sign in to upgrade your kitchen plan.");
      return;
    }

    setIsUpgrading(true);
    try {
      const res = await createCheckoutSession(user.email);
      if (res.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Missing checkout redirect destination");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to initiate Stripe checkout";
      toast.error(msg);
      setIsUpgrading(false);
    }
  };

  const isPremium = stats?.subscriptionTier === "premium";

  if (isSessionPending || (isLoading && user?.email)) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="w-9 h-9 animate-spin text-[#8E1616]" />
        <p className="text-sm font-semibold text-[#6E5F5B]">
          Loading subscription tier and quota...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-[#EBE4D8] shadow-sm text-center space-y-4 my-16">
        <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-2xl font-black">
          PH
        </div>
        <h2 className="text-2xl font-black text-[#190F0E]">Vendor Sign In Required</h2>
        <p className="text-sm text-[#6E5F5B]">
          Please sign in with your vendor account to view your kitchen tier and upgrade plans.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full bg-[#8E1616] text-white font-bold text-sm hover:bg-[#721212] transition-colors"
        >
          Sign In as Vendor
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-6">
        <div className="space-y-1">
          <Link
            href="/vendor/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8E1616] hover:underline uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Kitchen Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8E1616]/10 text-[#8E1616] text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            Kitchen Tier Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#190F0E] tracking-tight">
            Scale Your Artisan Pizzeria
          </h1>
          <p className="text-sm sm:text-base text-[#6E5F5B] max-w-2xl">
            Choose the membership that matches your kitchen volume. Upgrade to unlock unlimited
            artisan recipes, gold storefront badges, and express dispatch.
          </p>
        </div>

        {isPremium ? (
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 font-bold text-sm shadow-sm">
            <Crown className="w-5 h-5 text-amber-600 fill-amber-500" />
            <span>Active Master Baker</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-[#6E5F5B] font-semibold text-sm">
            <span>Free Artisan Tier</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-white rounded-3xl p-8 border border-[#EBE4D8] shadow-sm flex flex-col justify-between relative">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#6E5F5B]">
                Starter Plan
              </span>
              <h2 className="text-2xl font-black text-[#190F0E]">Free Artisan</h2>
              <p className="text-xs text-[#6E5F5B]">
                Ideal for neighborhood pop-ups and test kitchens starting out on PizzaHub.
              </p>
            </div>

            <div className="flex items-baseline gap-1 text-[#190F0E]">
              <span className="text-4xl font-black">$0</span>
              <span className="text-xs font-bold text-[#6E5F5B]">/ month</span>
            </div>

            <ul className="space-y-3.5 text-sm text-[#190F0E] border-t border-[#EBE4D8] pt-6">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Up to 3 active pizza items in catalog</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Live hearth order queue and dispatch controls</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Standard customer storefront discovery</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Direct customer delivery address mapping</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              disabled
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#EBE4D8] text-[#6E5F5B] font-bold text-sm bg-stone-50 cursor-default"
            >
              {!isPremium ? "Current Active Tier" : "Basic Tier"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border-2 border-amber-500 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[11px] font-black uppercase tracking-wider px-5 py-1.5 rounded-bl-2xl flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Recommended for Pizzerias
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700">
                <Crown className="w-4 h-4 fill-amber-500 text-amber-600" />
                Master Baker Status
              </div>
              <h2 className="text-2xl font-black text-[#190F0E]">Premium Master Baker</h2>
              <p className="text-xs text-[#6E5F5B]">
                Engineered for serious artisanal pizzerias looking to maximize daily volume.
              </p>
            </div>

            <div className="flex items-baseline gap-1 text-[#190F0E]">
              <span className="text-4xl font-black text-[#8E1616]">$29</span>
              <span className="text-xs font-bold text-[#6E5F5B]">/ month</span>
            </div>

            <ul className="space-y-3.5 text-sm text-[#190F0E] border-t border-[#EBE4D8] pt-6">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[#190F0E]">Unlimited active pizza items</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Gold Crown badge across all menu cards and storefront</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Priority order dispatch and express chef banner</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Comprehensive customer sales and volume reports</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Priority wood-fired technical and kitchen support</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            {isPremium ? (
              <div className="w-full py-3.5 px-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 font-bold text-sm text-center flex items-center justify-center gap-2">
                <Crown className="w-4 h-4 fill-amber-500 text-amber-600" />
                Active Premium Plan
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#8E1616] hover:bg-[#721212] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Stripe Checkout...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>Upgrade to Premium — $29/mo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#190F0E]">Artisan Satisfaction Guarantee</h3>
            <p className="text-xs text-[#6E5F5B]">
              Transactions are encrypted with Stripe 256-bit security. Cancel anytime with a single click.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/vendor/dashboard"
            className="px-5 py-2.5 rounded-full border border-[#EBE4D8] text-xs font-bold text-[#190F0E] hover:bg-stone-100 transition-colors"
          >
            Manage Existing Recipes
          </Link>
          <Link
            href="/vendor/add-pizza"
            className="px-5 py-2.5 rounded-full bg-[#190F0E] text-white text-xs font-bold hover:bg-black transition-colors"
          >
            Create New Recipe
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VendorUpgradePage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6">
      <Suspense
        fallback={
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="w-9 h-9 animate-spin text-[#8E1616]" />
            <p className="text-sm font-semibold text-[#6E5F5B]">Loading subscription plans...</p>
          </div>
        }
      >
        <UpgradeContent />
      </Suspense>
    </main>
  );
}
