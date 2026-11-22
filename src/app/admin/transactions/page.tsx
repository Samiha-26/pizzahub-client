"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  Crown,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Store,
  Calendar,
  Copy,
  Check,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import { getAdminTransactions, type AdminTransaction } from "@/lib/api";

export default function AdminTransactionsPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const currentUser = session?.user as any;

  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminTransactions();
      setTransactions(data);
    } catch {
      toast.error("Failed to load transaction audit ledger");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchTransactions();
    } else if (!isSessionPending) {
      setIsLoading(false);
    }
  }, [currentUser?.role, isSessionPending, fetchTransactions]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Transaction ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = transactions.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const emailMatch = (t.vendorEmail || "").toLowerCase().includes(q);
    const sessionMatch = ((t.sessionId || t._id || t.transactionId || "") as string)
      .toLowerCase()
      .includes(q);
    return emailMatch || sessionMatch;
  });

  const totalRevenue = transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const avgTransaction = transactions.length > 0 ? totalRevenue / transactions.length : 0;
  const premiumCount = transactions.filter((t) => (t as any).tier === "premium" || (t.plan || "").includes("Premium")).length;

  if (isSessionPending || (isLoading && currentUser?.role === "admin" && transactions.length === 0)) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-9 h-9 animate-spin text-[#8E1616] dark:text-[#E23E3E]" />
          <p className="text-sm font-semibold text-[#6E5F5B] dark:text-zinc-400">Loading Stripe payment audit ledger...</p>
        </div>
      </main>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-24 px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-white dark:bg-[#1A1110] rounded-3xl p-8 border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto text-2xl font-black">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#190F0E] dark:text-white">Admin Authorization Required</h2>
          <p className="text-sm text-[#6E5F5B] dark:text-zinc-400">
            Financial transaction auditing is restricted to platform administrators. Please sign in with an admin account.
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] dark:border-[#2D1E1B] pb-6">
          <div className="space-y-1">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8E1616] dark:text-[#E23E3E] hover:underline uppercase tracking-wider mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Operations Console
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold w-fit">
              <CreditCard className="w-3.5 h-3.5" />
              Financial Audit
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#190F0E] dark:text-white tracking-tight">
              Stripe Payment &amp; Audit Ledger
            </h1>
            <p className="text-sm text-[#6E5F5B] dark:text-zinc-400 max-w-2xl">
              Immutable ledger of verified Stripe checkout transactions, $29/mo recurring vendor memberships, and billing receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTransactions}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1A1110] border border-[#EBE4D8] dark:border-[#2D1E1B] text-xs font-bold text-[#190F0E] dark:text-zinc-200 hover:bg-stone-50 dark:hover:bg-[#251715] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Ledger
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-[#1A1110] p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#6E5F5B] dark:text-zinc-400">
                Total Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#190F0E] dark:text-white">
              ${totalRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
              USD collected via Stripe Checkout
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1110] p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#6E5F5B] dark:text-zinc-400">
                Total Transactions
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#190F0E] dark:text-white">
              {transactions.length}
            </div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
              Verified receipts in ledger
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1110] p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#6E5F5B] dark:text-zinc-400">
                Premium Upgrades
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-500" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#190F0E] dark:text-white">
              {premiumCount}
            </div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
              Master Baker subscriptions
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1110] p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#6E5F5B] dark:text-zinc-400">
                Avg Transaction
              </span>
              <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-zinc-800 text-[#190F0E] dark:text-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#8E1616] dark:text-[#FF8080]" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#190F0E] dark:text-white">
              ${avgTransaction.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
              Per checkout transaction
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1110] p-4 sm:p-6 rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E5F5B] dark:text-zinc-400" />
              <input
                type="text"
                placeholder="Search by vendor email or session ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#251715] border border-[#EBE4D8] dark:border-[#3D2825] text-xs font-bold text-[#190F0E] dark:text-white placeholder:text-[#6E5F5B]/70 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
              />
            </div>

            <div className="text-xs font-bold text-[#6E5F5B] dark:text-zinc-400 self-center">
              Showing {filtered.length} of {transactions.length} verified records
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#EBE4D8] dark:border-[#2D1E1B]">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#FAF7F2] dark:bg-[#160D0C] border-b border-[#EBE4D8] dark:border-[#2D1E1B] text-[#6E5F5B] dark:text-zinc-400 uppercase tracking-wider text-[10px] font-black">
                  <th className="py-3.5 px-4">Transaction / Session ID</th>
                  <th className="py-3.5 px-4">Partner Pizzeria</th>
                  <th className="py-3.5 px-4">Plan / Purpose</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Gateway</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4D8] dark:divide-[#2D1E1B] bg-white dark:bg-[#1A1110]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#6E5F5B] dark:text-zinc-400">
                      No transaction records match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t, idx) => {
                    const rawId = (t.sessionId || t.transactionId || t._id || `txn_${idx}`) as string;
                    const isCopied = copiedId === rawId;
                    const dateObj = new Date(t.createdAt);
                    const formattedDate = dateObj.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={rawId} className="hover:bg-stone-50/60 dark:hover:bg-[#251715]/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] bg-stone-100 dark:bg-zinc-800 text-[#190F0E] dark:text-zinc-200 px-2 py-0.5 rounded-md border border-[#EBE4D8] dark:border-[#3D2825] max-w-[150px] truncate" title={rawId}>
                              {rawId.length > 20 ? `${rawId.slice(0, 10)}...${rawId.slice(-8)}` : rawId}
                            </span>
                            <button
                              onClick={() => handleCopy(rawId)}
                              title="Copy full transaction ID"
                              className="p-1 rounded text-[#6E5F5B] dark:text-zinc-400 hover:text-[#190F0E] dark:hover:text-white hover:bg-stone-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-[#190F0E] dark:text-white">
                            <Store className="w-3.5 h-3.5 text-[#8E1616] dark:text-[#FF8080] shrink-0" />
                            <span>{t.vendorEmail}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 font-bold text-[11px]">
                            <Crown className="w-3 h-3 fill-amber-500 text-amber-600 dark:text-amber-400" />
                            <span>Vendor Premium Membership</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-black text-emerald-800 dark:text-emerald-400 text-sm">
                            ${Number(t.amount || 29).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-[#6E5F5B] dark:text-zinc-400 font-bold ml-1 uppercase">
                            {t.currency || "USD"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-[#190F0E] dark:text-zinc-200 font-bold text-[10px] border border-stone-200 dark:border-zinc-700 uppercase">
                            <CreditCard className="w-3 h-3 text-[#6E5F5B] dark:text-zinc-400" />
                            Stripe Card
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#6E5F5B] dark:text-zinc-400 font-medium text-[11px]">
                          {formattedDate}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
