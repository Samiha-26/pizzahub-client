"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Plus,
  ShoppingBag,
  Store,
  Crown,
  ChefHat,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  UtensilsCrossed,
} from "lucide-react";
import { getVendorStats, type VendorStats } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

export default function VendorDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user;

  const [stats, setStats] = useState<VendorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user?.email) return;
    setIsLoading(true);
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

  if (isSessionPending || (isLoading && user?.email)) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-9 h-9 animate-spin text-[#8E1616]" />
          <p className="text-sm font-semibold text-[#6E5F5B]">
            Firing kitchen portal metrics &amp; hearth quota...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-[#EBE4D8] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-2xl font-black">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#190F0E]">Vendor Kitchen Portal</h1>
          <p className="text-xs text-[#6E5F5B] leading-relaxed">
            Please sign in with your vendor account to manage your stone-hearth menu, track kitchen queue dispatches, and upgrade subscription limits.
          </p>
          <button
            onClick={() => router.push("/signin?redirect=/vendor/dashboard")}
            className="w-full py-3 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-bold transition shadow-sm"
          >
            Sign In to Kitchen Portal
          </button>
        </div>
      </main>
    );
  }

  const isPremium = stats?.subscriptionTier === "premium";
  const itemCount = stats?.itemCount || 0;
  const isLimitReached = !isPremium && itemCount >= 3;
  const slotsRemaining = isPremium ? "Unlimited" : Math.max(0, 3 - itemCount);

  return (
    <main className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E1616] uppercase tracking-wider mb-1">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Vendor Kitchen Portal</span>
              <span>•</span>
              <span className="text-[#6E5F5B]">Artisan Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] tracking-tight">
              {user.name || "Artisan Kitchen"} Hearth HQ
            </h1>
            <p className="text-xs text-[#6E5F5B] mt-1">
              Manage stone-baked recipes, monitor live baking tickets, and track bakery earnings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchStats()}
              className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#EBE4D8] hover:border-[#8E1616]/30 text-xs font-bold text-[#190F0E] flex items-center gap-1.5 transition shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#8E1616]" />
              Refresh
            </button>
            <Link
              href="/vendor/add-pizza"
              className="px-4 py-2.5 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-xs font-bold text-white flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Craft New Pizza
            </Link>
          </div>
        </div>

        <div
          className={`p-6 rounded-3xl border transition shadow-2xs ${
            isPremium
              ? "bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-amber-200"
              : isLimitReached
              ? "bg-red-50/70 border-red-200"
              : "bg-white border-[#EBE4D8]"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {isPremium ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-black tracking-wide shadow-2xs">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    PREMIUM VENDOR TIER
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#190F0E] text-white text-[11px] font-bold tracking-wide">
                    FREE ARTISAN TIER
                  </span>
                )}
                <span className="text-xs font-bold text-[#6E5F5B]">
                  {isPremium ? "Unlimited Hearth Slots" : `${itemCount} of 3 Slots Occupied`}
                </span>
              </div>

              <h2 className="text-base font-black text-[#190F0E]">
                {isPremium
                  ? "Unlimited Wood-Fired Menu Capacities Unlocked"
                  : isLimitReached
                  ? "Free Tier Hearth Capacity Reached (3 / 3 Items)"
                  : `You have ${slotsRemaining} free pizza slots remaining.`}
              </h2>
              <p className="text-xs text-[#6E5F5B] max-w-xl">
                {isPremium
                  ? "Your restaurant enjoys unrestricted menu catalog size, priority hearth placement, and a verified gold crown emblem on all customer-facing listings."
                  : isLimitReached
                  ? "Free tier vendors can author up to 3 live recipes. Upgrade to Premium for $29/mo to unlock unlimited recipes and priority kitchen placement."
                  : "On the free tier, you can author up to 3 artisanal pizzas with custom ingredients, crust selections, and ImgBB photos."}
              </p>
            </div>

            {!isPremium && (
              <Link
                href="/vendor/upgrade"
                className="shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Crown className="w-4 h-4 fill-current" />
                Upgrade to Premium
              </Link>
            )}
          </div>

          {!isPremium && (
            <div className="mt-4 pt-4 border-t border-[#EBE4D8]/60">
              <div className="w-full bg-[#EBE4D8] rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    isLimitReached ? "bg-red-500" : "bg-[#8E1616]"
                  }`}
                  style={{ width: `${Math.min(100, (itemCount / 3) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B]">
              <span>Active Pizzas</span>
              <div className="w-8 h-8 rounded-xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#190F0E]">{itemCount}</div>
            <div className="text-[11px] text-[#6E5F5B]">
              {isPremium ? "Unlimited available" : `${slotsRemaining} slots remaining`}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B]">
              <span>Total Orders Fired</span>
              <div className="w-8 h-8 rounded-xl bg-[#190F0E]/10 text-[#190F0E] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#190F0E]">
              {stats?.totalOrders || 0}
            </div>
            <div className="text-[11px] text-[#6E5F5B]">Lifetime customer dispatches</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B]">
              <span>Pending Hearth Tickets</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#190F0E]">
              {stats?.pendingOrders || 0}
            </div>
            <div className="text-[11px] text-[#6E5F5B]">Awaiting bake &amp; dispatch</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B]">
              <span>Kitchen Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700">
              ${stats?.totalRevenue?.toFixed(2) || "0.00"}
            </div>
            <div className="text-[11px] text-[#6E5F5B]">Gross fulfillment revenue</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-black text-[#190F0E]">Kitchen Action Hub</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/vendor/add-pizza"
              className="bg-white p-6 rounded-3xl border border-[#EBE4D8] hover:border-[#8E1616]/40 transition shadow-2xs group flex flex-col justify-between h-44"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mb-3 group-hover:bg-[#8E1616] group-hover:text-white transition">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#190F0E] group-hover:text-[#8E1616] transition">
                  Add Menu Item
                </h3>
                <p className="text-xs text-[#6E5F5B] mt-1 leading-relaxed">
                  Upload high-res photos via ImgBB, configure crust fermentations, and set pricing.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#8E1616] mt-2">
                <span>Add Menu Item</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>

            <Link
              href="/vendor/menu"
              className="bg-white p-6 rounded-3xl border border-[#EBE4D8] hover:border-[#8E1616]/40 transition shadow-2xs group flex flex-col justify-between h-44"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-stone-100 text-[#190F0E] flex items-center justify-center mb-3 group-hover:bg-[#190F0E] group-hover:text-white transition">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#190F0E] group-hover:text-[#8E1616] transition">
                  Manage Menu Catalog
                </h3>
                <p className="text-xs text-[#6E5F5B] mt-1 leading-relaxed">
                  View, edit ingredients, adjust pricing, and delete your authored pizzas.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#8E1616] mt-2">
                <span>Open Catalog</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>

            <Link
              href="/vendor/orders"
              className="bg-white p-6 rounded-3xl border border-[#EBE4D8] hover:border-[#8E1616]/40 transition shadow-2xs group flex flex-col justify-between h-44"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#190F0E] group-hover:text-[#8E1616] transition">
                  Live Kitchen Queue
                </h3>
                <p className="text-xs text-[#6E5F5B] mt-1 leading-relaxed">
                  Advance active customer tickets through Wood-Firing, Thermal Transit, and Delivery.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#8E1616] mt-2">
                <span>View Kitchen Orders</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
