"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Store,
  UtensilsCrossed,
  DollarSign,
  TrendingUp,
  CreditCard,
  ChefHat,
  ArrowRight,
  Loader2,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import { getAdminStats, type AdminStats } from "@/lib/api";

export default function AdminDashboardPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user as any;

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch {
      toast.error("Failed to load platform operations metrics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
    } else if (!isSessionPending) {
      setIsLoading(false);
    }
  }, [user?.role, isSessionPending, fetchStats]);

  if (isSessionPending || (isLoading && user?.role === "admin")) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-9 h-9 animate-spin text-[#8E1616] dark:text-[#E23E3E]" />
          <p className="text-sm font-semibold text-[#6E5F5B] dark:text-zinc-400">
            Synchronizing platform operations &amp; audit metrics...
          </p>
        </div>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-24 px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-white dark:bg-[#1A1110] rounded-3xl p-8 border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto text-2xl font-black">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#190F0E] dark:text-white">Admin Authorization Required</h2>
          <p className="text-sm text-[#6E5F5B] dark:text-zinc-400">
            The platform operations console is restricted to administrators. Please sign in with an administrator account to continue.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full bg-[#190F0E] dark:bg-[#8E1616] text-white font-bold text-sm hover:bg-black dark:hover:bg-[#A31D1D] transition-colors"
          >
            Sign In with Admin Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] dark:border-[#2D1E1B] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-bold w-fit">
              <ShieldAlert className="w-3.5 h-3.5" />
              Platform Administration
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#190F0E] dark:text-white tracking-tight">
              Artisan Operations &amp; Ledger
            </h1>
            <p className="text-sm text-[#6E5F5B] dark:text-zinc-400 max-w-2xl">
              High-level overview of platform gross revenue, user accounts, active pizzerias, and wood-fired recipe moderation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1A1110] border border-[#EBE4D8] dark:border-[#2D1E1B] text-xs font-bold text-[#190F0E] dark:text-zinc-200 hover:bg-stone-50 dark:hover:bg-[#251715] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Metrics
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-[#1A1110] p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#6E5F5B] dark:text-zinc-400">
                Total Platform Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#190F0E] dark:text-white">
              ${(stats?.totalRevenue ?? 0).toFixed(2)}
            </div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400 space-y-0.5">
              <div>Orders: ${(stats?.ordersRevenue ?? 0).toFixed(2)}</div>
              <div>Memberships: ${(stats?.subscriptionRevenue ?? 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1110] p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#6E5F5B] dark:text-zinc-400">
                Registered Accounts
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#190F0E] dark:text-white">
              {stats?.totalUsers ?? 0}
            </div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
              {stats?.totalVendors ?? 0} Pizzerias • {stats?.totalCustomers ?? 0} Customers
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1110] p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#6E5F5B] dark:text-zinc-400">
                Active Catalog Recipes
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#8E1616]/10 dark:bg-[#8E1616]/25 text-[#8E1616] dark:text-[#FF8080] flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#190F0E] dark:text-white">
              {stats?.totalPizzas ?? 0}
            </div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
              Across all verified partner storefronts
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1110] p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#6E5F5B] dark:text-zinc-400">
                Orders Processed
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#190F0E] dark:text-white">
              {stats?.totalOrders ?? 0}
            </div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
              Lifetime hearth dispatches platform-wide
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-[#190F0E] dark:text-white tracking-tight">
            Administrative Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <Link
              href="/admin/users"
              className="group bg-white dark:bg-[#1A1110] p-6 sm:p-7 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs hover:border-purple-300 dark:hover:border-purple-700/60 hover:shadow-md transition-all flex flex-col justify-between h-full min-h-0 overflow-hidden break-words"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#190F0E] dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors break-words">
                  User &amp; Role Management
                </h3>
                <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 leading-relaxed break-words">
                  Search registered users, promote customers to vendors, grant administrative privileges, or suspend accounts violating terms.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300 pt-3 border-t border-[#EBE4D8] dark:border-[#2D1E1B] mt-4 shrink-0">
                <span>Manage Accounts</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/menu"
              className="group bg-white dark:bg-[#1A1110] p-6 sm:p-7 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs hover:border-[#8E1616]/40 dark:hover:border-[#E23E3E]/40 hover:shadow-md transition-all flex flex-col justify-between h-full min-h-0 overflow-hidden break-words"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#8E1616]/10 dark:bg-[#8E1616]/25 text-[#8E1616] dark:text-[#FF8080] flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#190F0E] dark:text-white group-hover:text-[#8E1616] dark:group-hover:text-[#FF8080] transition-colors break-words">
                  Menu &amp; Recipe Moderation
                </h3>
                <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 leading-relaxed break-words">
                  Review artisan recipes created by partner kitchens, verify ingredients and imagery, flag policy violations, or remove listings.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[#8E1616] dark:text-[#FF8080] pt-3 border-t border-[#EBE4D8] dark:border-[#2D1E1B] mt-4 shrink-0">
                <span>Moderate Recipes</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/transactions"
              className="group bg-white dark:bg-[#1A1110] p-6 sm:p-7 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:shadow-md transition-all flex flex-col justify-between h-full min-h-0 overflow-hidden break-words sm:col-span-2 xl:col-span-1"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#190F0E] dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors break-words">
                  Stripe Payment Ledger
                </h3>
                <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 leading-relaxed break-words">
                  Audit all Stripe checkout transactions, $29/mo vendor membership upgrades, customer order payments, and timestamped transaction IDs.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 pt-3 border-t border-[#EBE4D8] dark:border-[#2D1E1B] mt-4 shrink-0">
                <span>View Transaction Ledger</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
