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
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-9 h-9 animate-spin text-[#8E1616]" />
          <p className="text-sm font-semibold text-[#6E5F5B] dark:text-zinc-400">
            Firing kitchen portal metrics &amp; hearth quota...
          </p>
        </div>
      </main>
    );
  }

  if (!user || ((user as any).role !== "vendor" && (user as any).role !== "admin")) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-20 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-[#1A1110] rounded-3xl p-8 border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-2xl font-black">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#190F0E] dark:text-white">Vendor Kitchen Portal</h1>
          <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 leading-relaxed">
            This dashboard is restricted to restaurant vendors and pizzerias. Please sign in with a verified vendor account.
          </p>
          <button
            onClick={() => router.push("/signin?redirect=/vendor/dashboard")}
            className="w-full py-3 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Sign In with Vendor Account
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
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] dark:border-[#2D1E1B] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E1616] uppercase tracking-wider mb-1">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Vendor Kitchen Portal</span>
              <span>•</span>
              <span className="text-[#6E5F5B] dark:text-zinc-400">Artisan Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] dark:text-white tracking-tight">
              {user.name || "Artisan Kitchen"} Hearth HQ
            </h1>
            <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 mt-1">
              Manage stone-baked recipes, monitor live baking tickets, and track bakery earnings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchStats()}
              className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] hover:border-[#8E1616]/30 text-xs font-bold text-[#190F0E] dark:text-zinc-200 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
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
              ? "bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-amber-200 dark:border-amber-800/40"
              : isLimitReached
              ? "bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-800/40"
              : "bg-white dark:bg-[#1A1110] border-[#EBE4D8] dark:border-[#2D1E1B]"
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
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#190F0E] dark:bg-zinc-800 text-white text-[11px] font-bold tracking-wide">
                    FREE ARTISAN TIER
                  </span>
                )}
                <span className="text-xs font-bold text-[#6E5F5B] dark:text-zinc-400">
                  {isPremium ? "Unlimited Hearth Slots" : `${itemCount} of 3 Slots Occupied`}
                </span>
              </div>

              <h2 className="text-base font-black text-[#190F0E] dark:text-white">
                {isPremium
                  ? "Unlimited Wood-Fired Menu Capacities Unlocked"
                  : isLimitReached
                  ? "Free Tier Hearth Capacity Reached (3 / 3 Items)"
                  : `You have ${slotsRemaining} free pizza slots remaining.`}
              </h2>
              <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 max-w-xl">
                {isPremium
                  ? "Your restaurant enjoys unrestricted menu catalog size, priority hearth placement, and a verified gold crown emblem on all customer-facing listings."
                  : isLimitReached
                  ? "Free tier vendors can author up to 3 live recipes. Upgrade to Premium for $29/mo to unlock unlimited recipes and priority kitchen placement."
                  : "On the free tier, you can author up to 3 artisanal pizzas with custom ingredients, crust selections, and ImgBB photos."}
              </p>
            </div>

            {!isPremium ? (
              <Link
                href="/vendor/upgrade"
                className="shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Crown className="w-4 h-4 fill-current" />
                Upgrade to Premium
              </Link>
            ) : (
              <Link
                href="/vendor/upgrade"
                className="shrink-0 px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-extrabold flex items-center justify-center gap-2 transition"
              >
                <Crown className="w-4 h-4 fill-amber-500 text-amber-600 dark:text-amber-400" />
                Manage Membership
              </Link>
            )}
          </div>

          {!isPremium && (
            <div className="mt-4 pt-4 border-t border-[#EBE4D8]/60 dark:border-[#2D1E1B]">
              <div className="w-full bg-[#EBE4D8] dark:bg-[#2D1E1B] rounded-full h-2.5 overflow-hidden">
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
          <div className="bg-white dark:bg-[#1A1110] p-5 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B] dark:text-zinc-400">
              <span>Active Pizzas</span>
              <div className="w-8 h-8 rounded-xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#190F0E] dark:text-white">{itemCount}</div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
              {isPremium ? "Unlimited available" : `${slotsRemaining} slots remaining`}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1110] p-5 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B] dark:text-zinc-400">
              <span>Total Orders Fired</span>
              <div className="w-8 h-8 rounded-xl bg-[#190F0E]/10 dark:bg-white/10 text-[#190F0E] dark:text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#190F0E] dark:text-white">
              {stats?.totalOrders || 0}
            </div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">Lifetime customer dispatches</div>
          </div>

          <div className="bg-white dark:bg-[#1A1110] p-5 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B] dark:text-zinc-400">
              <span>Pending Hearth Tickets</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#190F0E] dark:text-white">
              {stats?.pendingOrders || 0}
            </div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">Awaiting bake &amp; dispatch</div>
          </div>

          <div className="bg-white dark:bg-[#1A1110] p-5 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B] dark:text-zinc-400">
              <span>Kitchen Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              ${stats?.totalRevenue?.toFixed(2) || "0.00"}
            </div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">Gross fulfillment revenue</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-black text-[#190F0E] dark:text-white">Kitchen Action Hub</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <Link
              href="/vendor/add-pizza"
              className="bg-white dark:bg-[#1A1110] p-5 sm:p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] hover:border-[#8E1616]/40 transition shadow-2xs group flex flex-col justify-between h-full min-h-0 overflow-hidden break-words cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mb-3 group-hover:bg-[#8E1616] group-hover:text-white transition shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#190F0E] dark:text-white group-hover:text-[#8E1616] dark:group-hover:text-[#E25C5C] transition break-words">
                  Add Menu Item
                </h3>
                <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 mt-2 leading-relaxed break-words">
                  Upload high-res photos via ImgBB, configure crust fermentations, and set pricing.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[#8E1616] dark:text-[#E25C5C] mt-5 pt-3.5 border-t border-[#F5EFE6] dark:border-[#2D1E1B] shrink-0">
                <span>Add Menu Item</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>

            <Link
              href="/vendor/menu"
              className="bg-white dark:bg-[#1A1110] p-5 sm:p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] hover:border-[#8E1616]/40 transition shadow-2xs group flex flex-col justify-between h-full min-h-0 overflow-hidden break-words cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 text-[#190F0E] dark:text-zinc-200 flex items-center justify-center mb-3 group-hover:bg-[#190F0E] group-hover:text-white transition shrink-0">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#190F0E] dark:text-white group-hover:text-[#8E1616] dark:group-hover:text-[#E25C5C] transition break-words">
                  Manage Menu Catalog
                </h3>
                <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 mt-2 leading-relaxed break-words">
                  View, edit ingredients, adjust pricing, and delete your authored pizzas.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[#8E1616] dark:text-[#E25C5C] mt-5 pt-3.5 border-t border-[#F5EFE6] dark:border-[#2D1E1B] shrink-0">
                <span>Open Catalog</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>

            <Link
              href="/vendor/orders"
              className="bg-white dark:bg-[#1A1110] p-5 sm:p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] hover:border-[#8E1616]/40 transition shadow-2xs group flex flex-col justify-between h-full min-h-0 overflow-hidden break-words cursor-pointer sm:col-span-2 xl:col-span-1"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#190F0E] dark:text-white group-hover:text-[#8E1616] dark:group-hover:text-[#E25C5C] transition break-words">
                  Live Kitchen Queue
                </h3>
                <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 mt-2 leading-relaxed break-words">
                  Advance active customer tickets through Wood-Firing, Thermal Transit, and Delivery.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[#8E1616] dark:text-[#E25C5C] mt-5 pt-3.5 border-t border-[#F5EFE6] dark:border-[#2D1E1B] shrink-0">
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
