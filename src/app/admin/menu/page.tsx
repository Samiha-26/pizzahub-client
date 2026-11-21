"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  EyeOff,
  Trash2,
  ArrowLeft,
  Loader2,
  RefreshCw,
  ExternalLink,
  Store,
  MapPin,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import {
  getAdminMenu,
  updateMenuModeration,
  deleteAdminMenuItem,
  type AdminMenuItem,
} from "@/lib/api";

export default function AdminMenuPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const currentUser = session?.user as any;

  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminMenu({
        search,
        category: categoryFilter,
      });
      setItems(data);
    } catch {
      toast.error("Failed to load catalog moderation feed");
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchMenu();
    } else if (!isSessionPending) {
      setIsLoading(false);
    }
  }, [currentUser?.role, isSessionPending, fetchMenu]);

  const handleModerationChange = async (itemId: string, moderationStatus: string) => {
    setActionLoadingId(itemId);
    try {
      await updateMenuModeration(itemId, moderationStatus as any);
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, moderationStatus: moderationStatus as any } : i
        )
      );
      toast.success(`Recipe moderation status set to ${moderationStatus}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update moderation";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (itemId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently remove "${title}" from the catalog?`)) {
      return;
    }

    setActionLoadingId(itemId);
    try {
      await deleteAdminMenuItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success("Recipe permanently removed by administrator");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove recipe";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isSessionPending || (isLoading && currentUser?.role === "admin" && items.length === 0)) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-9 h-9 animate-spin text-[#8E1616]" />
          <p className="text-sm font-semibold text-[#6E5F5B]">Loading menu moderation feed...</p>
        </div>
      </main>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-24 px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-[#EBE4D8] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-2xl font-black">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#190F0E]">Admin Authorization Required</h2>
          <p className="text-sm text-[#6E5F5B]">
            Catalog moderation is restricted to platform administrators. Please sign in with an admin account.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full bg-[#190F0E] text-white font-bold text-sm hover:bg-black transition-colors"
          >
            Sign In with Admin Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-6">
          <div className="space-y-1">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8E1616] hover:underline uppercase tracking-wider mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Operations Console
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8E1616]/10 text-[#8E1616] text-xs font-bold w-fit">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Menu Moderation
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#190F0E] tracking-tight">
              Artisan Catalog Moderation
            </h1>
            <p className="text-sm text-[#6E5F5B] max-w-2xl">
              Inspect pizza recipes authored by partner pizzerias, verify dough and crust standards, flag unverified listings, or remove policy infractions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMenu}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#EBE4D8] text-xs font-bold text-[#190F0E] hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Feed
            </button>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E5F5B]" />
              <input
                type="text"
                placeholder="Search by recipe, pizzeria, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE4D8] text-xs font-bold text-[#190F0E] placeholder:text-[#6E5F5B]/70 focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#6E5F5B]" />
              <span className="text-xs font-bold text-[#6E5F5B]">Style:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] text-xs font-bold text-[#190F0E] focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
              >
                <option value="all">All Styles</option>
                <option value="Neapolitan">Neapolitan</option>
                <option value="New York">New York</option>
                <option value="Detroit">Detroit</option>
                <option value="Sicilian">Sicilian</option>
                <option value="Chicago Deep Dish">Chicago Deep Dish</option>
                <option value="Gluten-Free Artisanal">Gluten-Free Artisanal</option>
                <option value="Calzones">Calzones</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#EBE4D8]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EBE4D8] text-[#6E5F5B] uppercase tracking-wider text-[10px] font-black">
                  <th className="py-3.5 px-4">Artisan Recipe</th>
                  <th className="py-3.5 px-4">Partner Pizzeria</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Moderation Decision</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4D8] bg-white">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#6E5F5B]">
                      No pizza recipes match the selected filters.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isBusy = actionLoadingId === item.id;
                    const status = item.moderationStatus || "approved";

                    return (
                      <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.itemName}
                              className="w-12 h-12 rounded-xl object-cover border border-[#EBE4D8] shrink-0"
                            />
                            <div className="space-y-0.5">
                              <div className="font-bold text-[#190F0E]">{item.itemName}</div>
                              <div className="text-[11px] font-semibold text-[#8E1616]">
                                {item.category}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="font-bold text-[#190F0E] flex items-center gap-1.5">
                              <Store className="w-3.5 h-3.5 text-[#8E1616]" />
                              <span>{item.vendorName}</span>
                            </div>
                            <div className="text-[11px] text-[#6E5F5B] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#6E5F5B]" />
                              <span>{item.location}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-black text-[#190F0E]">
                          ${item.price.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4">
                          {status === "approved" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          )}
                          {status === "flagged" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                              <AlertTriangle className="w-3 h-3" />
                              Flagged
                            </span>
                          )}
                          {status === "hidden" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[11px]">
                              <EyeOff className="w-3 h-3" />
                              Hidden
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            disabled={isBusy}
                            value={status}
                            onChange={(e) => handleModerationChange(item.id, e.target.value)}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#EBE4D8] text-xs font-bold text-[#190F0E] focus:outline-none focus:ring-2 focus:ring-[#8E1616] disabled:opacity-50 cursor-pointer"
                          >
                            <option value="approved">Approved</option>
                            <option value="flagged">Flag for Review</option>
                            <option value="hidden">Hide from Catalog</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/menu/${item.id}`}
                              target="_blank"
                              title="Preview on public storefront"
                              className="p-1.5 rounded-lg border border-[#EBE4D8] hover:bg-stone-100 text-[#190F0E] transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              disabled={isBusy}
                              onClick={() => handleDelete(item.id, item.itemName)}
                              title="Delete recipe"
                              className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {isBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
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
