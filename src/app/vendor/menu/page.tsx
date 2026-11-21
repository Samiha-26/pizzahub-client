"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ChefHat,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Flame,
  Crown,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import {
  getVendorMenu,
  updateVendorPizza,
  deleteVendorPizza,
  type PizzaDetail,
  type VendorMenuResponse,
} from "@/lib/api";
import { useSession } from "@/lib/auth-client";

const CRUST_OPTIONS = [
  "Neapolitan 48h",
  "Roman Thin Crust",
  "Detroit Pan",
  "Gluten-Free Cauliflower",
  "Sourdough Stuffed",
];

const CATEGORY_OPTIONS = [
  "Wood-Fired",
  "Classic Italian",
  "White Base",
  "Spicy & Fiery",
  "Vegetarian & Plant",
];

export default function VendorMenuPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user;

  const [menuData, setMenuData] = useState<VendorMenuResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrust, setSelectedCrust] = useState("All");

  const [editingPizza, setEditingPizza] = useState<PizzaDetail | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCrust, setEditCrust] = useState(CRUST_OPTIONS[0]);
  const [editCategory, setEditCategory] = useState(CATEGORY_OPTIONS[0]);
  const [editIngredients, setEditIngredients] = useState("");
  const [editPrepTime, setEditPrepTime] = useState("15");
  const [editCalories, setEditCalories] = useState("850");

  const fetchMenu = useCallback(async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const data = await getVendorMenu(user.email);
      setMenuData(data);
    } catch {
      toast.error("Failed to fetch kitchen menu items");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchMenu();
    } else if (!isSessionPending) {
      setIsLoading(false);
    }
  }, [user?.email, isSessionPending, fetchMenu]);

  const handleOpenEdit = (pizza: PizzaDetail) => {
    setEditingPizza(pizza);
    setEditName(pizza.name);
    setEditTagline(pizza.tagline || "");
    setEditDescription(pizza.description || "");
    setEditPrice(pizza.price.toString());
    setEditCrust(pizza.crust || CRUST_OPTIONS[0]);
    setEditCategory(pizza.category || CATEGORY_OPTIONS[0]);
    setEditIngredients((pizza.ingredients || []).join(", "));
    setEditPrepTime((pizza.prepTimeMinutes || 15).toString());
    setEditCalories((pizza.calories || 850).toString());
  };

  const handleCloseEdit = () => {
    setEditingPizza(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPizza || !user?.email) return;

    if (!editName.trim()) {
      toast.error("Pizza name cannot be empty");
      return;
    }

    if (!editPrice || Number(editPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSavingEdit(true);

    try {
      const parsedIngredients = editIngredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: editName.trim(),
        tagline: editTagline.trim(),
        description: editDescription.trim(),
        price: Number(Number(editPrice).toFixed(2)),
        crust: editCrust,
        category: editCategory,
        ingredients: parsedIngredients,
        prepTimeMinutes: Number(editPrepTime) || 15,
        calories: Number(editCalories) || 850,
        vendorEmail: user.email,
      };

      await updateVendorPizza(editingPizza.id, payload);

      toast.success(`"${editName}" updated successfully!`, { icon: "🍕" });

      setMenuData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === editingPizza.id
              ? { ...item, ...payload, price: Number(Number(editPrice).toFixed(2)) }
              : item
          ),
        };
      });

      handleCloseEdit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update pizza";
      toast.error(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (pizza: PizzaDetail) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${pizza.name}" from your hearth catalog?`
    );
    if (!confirmed) return;

    setDeletingId(pizza.id);

    try {
      await deleteVendorPizza(pizza.id);
      toast.success(`"${pizza.name}" deleted from your menu`, { icon: "🗑️" });

      setMenuData((prev) => {
        if (!prev) return null;
        const newItems = prev.items.filter((item) => item.id !== pizza.id);
        const isPremium = prev.subscriptionTier === "premium";
        return {
          ...prev,
          items: newItems,
          itemCount: newItems.length,
          canAddMore: isPremium || newItems.length < 3,
        };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete pizza";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  if (isSessionPending || (isLoading && user?.email)) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-9 h-9 animate-spin text-[#8E1616]" />
          <p className="text-sm font-semibold text-[#6E5F5B]">
            Fetching your kitchen menu catalog...
          </p>
        </div>
      </main>
    );
  }

  if (!user || ((user as any).role !== "vendor" && (user as any).role !== "admin")) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-[#EBE4D8] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-2xl font-black">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#190F0E]">Vendor Sign In Required</h1>
          <p className="text-xs text-[#6E5F5B] leading-relaxed">
            Please log in with your vendor account to view and manage your restaurant menu catalog.
          </p>
          <button
            onClick={() => router.push("/signin?redirect=/vendor/menu")}
            className="w-full py-3 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-bold transition shadow-sm"
          >
            Sign In to Kitchen Portal
          </button>
        </div>
      </main>
    );
  }

  const items = menuData?.items || [];
  const isPremium = menuData?.subscriptionTier === "premium";
  const itemCount = menuData?.itemCount || items.length;
  const isLimitReached = !isPremium && itemCount >= 3;
  const slotsRemaining = isPremium ? "Unlimited" : Math.max(0, 3 - itemCount);

  const filteredItems = items.filter((p) => {
    const matchSearch =
      searchTerm.trim() === "" ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.ingredients || []).some((ing) => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCrust = selectedCrust === "All" || p.crust === selectedCrust;
    return matchSearch && matchCrust;
  });

  return (
    <main className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E1616] uppercase tracking-wider mb-1">
              <Link href="/vendor/dashboard" className="hover:underline flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5" />
                <span>Kitchen HQ</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#6E5F5B]" />
              <span className="text-[#6E5F5B]">Menu Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] tracking-tight">
              Artisan Menu Catalog
            </h1>
            <p className="text-xs text-[#6E5F5B] mt-1">
              Live stone-hearth creations authored by {user.name || "your pizzeria"}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchMenu()}
              className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#EBE4D8] hover:border-[#8E1616]/30 text-xs font-bold text-[#190F0E] flex items-center gap-1.5 transition shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#8E1616]" />
              Refresh
            </button>
            <Link
              href="/vendor/add-pizza"
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-1.5 transition shadow-sm ${
                isLimitReached
                  ? "bg-[#6E5F5B] opacity-80 cursor-not-allowed"
                  : "bg-[#8E1616] hover:bg-[#721111]"
              }`}
            >
              <Plus className="w-4 h-4" />
              Craft New Pizza
            </Link>
          </div>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-3xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
            isPremium
              ? "bg-amber-500/10 border-amber-200"
              : isLimitReached
              ? "bg-red-50 border-red-200"
              : "bg-white border-[#EBE4D8]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isPremium
                  ? "bg-amber-500 text-white"
                  : isLimitReached
                  ? "bg-red-500 text-white"
                  : "bg-[#8E1616]/10 text-[#8E1616]"
              }`}
            >
              {isPremium ? <Crown className="w-5 h-5 fill-current" /> : <Flame className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-[#190F0E]">
                  {isPremium ? "Premium Unlimited Hearth" : "Free Artisan Tier"}
                </span>
                <span className="text-[11px] font-bold text-[#6E5F5B]">
                  • {itemCount} {isPremium ? "menu items active" : "of 3 slots used"}
                </span>
              </div>
              <p className="text-xs text-[#6E5F5B] mt-0.5">
                {isPremium
                  ? "Unlimited pizza slots, verified crown badge, and priority dispatch."
                  : isLimitReached
                  ? "You have reached your 3-pizza free limit. Upgrade to list additional creations."
                  : `You have ${slotsRemaining} free menu item slot${slotsRemaining === 1 ? "" : "s"} remaining.`}
              </p>
            </div>
          </div>

          {!isPremium && (
            <Link
              href="/vendor/upgrade"
              className="shrink-0 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-2xs transition"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              Upgrade ($29/mo)
            </Link>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-[#EBE4D8] p-4 flex flex-col sm:flex-row gap-3 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by pizza name or ingredients..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EBE4D8] text-xs text-[#190F0E] focus:outline-hidden focus:border-[#8E1616] transition bg-[#FAF7F2]/50 placeholder:text-gray-400"
            />
          </div>

          <div className="sm:w-56">
            <select
              value={selectedCrust}
              onChange={(e) => setSelectedCrust(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#EBE4D8] text-xs font-bold text-[#190F0E] bg-white focus:outline-hidden focus:border-[#8E1616] transition cursor-pointer"
            >
              <option value="All">All Crust Styles</option>
              {CRUST_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EBE4D8] p-12 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-3xl">
              🍕
            </div>
            <h2 className="text-lg font-black text-[#190F0E]">No Pizzas Listed Yet</h2>
            <p className="text-xs text-[#6E5F5B] max-w-sm mx-auto">
              Your kitchen catalog is currently empty. Fire up your first stone-baked creation and make it available to hungry pizza lovers!
            </p>
            <Link
              href="/vendor/add-pizza"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Craft Your First Pizza
            </Link>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EBE4D8] p-8 text-center space-y-2 shadow-2xs">
            <h3 className="text-base font-bold text-[#190F0E]">No Matching Pizzas</h3>
            <p className="text-xs text-[#6E5F5B]">
              No menu items match &quot;{searchTerm}&quot; under the selected crust style.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCrust("All");
              }}
              className="text-xs font-bold text-[#8E1616] hover:underline pt-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#EBE4D8] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#EBE4D8] bg-[#FAF7F2]/80 text-[#6E5F5B] uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="py-4 px-4 sm:px-6">Artisan Creation</th>
                    <th className="py-4 px-4">Crust &amp; Category</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4 hidden md:table-cell">Bake Profile</th>
                    <th className="py-4 px-4 hidden lg:table-cell">Ingredients</th>
                    <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4D8]/60">
                  {filteredItems.map((pizza) => (
                    <tr
                      key={pizza.id}
                      className="hover:bg-[#FAF7F2]/40 transition"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#EBE4D8] bg-[#FAF7F2]">
                            <img
                              src={
                                pizza.image ||
                                "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
                              }
                              alt={pizza.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-0.5 max-w-xs">
                            <div className="font-extrabold text-sm text-[#190F0E] truncate">
                              {pizza.name}
                            </div>
                            <div className="text-[11px] text-[#6E5F5B] italic truncate">
                              {pizza.tagline || "Wood-Fired Creation"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EBE4D8] text-[10px] font-bold text-[#190F0E]">
                            {pizza.crust}
                          </span>
                          <div className="text-[11px] text-[#8E1616] font-semibold">
                            {pizza.category}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-sm font-black text-[#8E1616]">
                          ${pizza.price.toFixed(2)}
                        </div>
                      </td>

                      <td className="py-4 px-4 hidden md:table-cell text-[#6E5F5B]">
                        <div className="space-y-0.5 text-[11px]">
                          <div>⏱️ {pizza.prepTimeMinutes || 15} min prep</div>
                          <div>🔥 {pizza.calories || 850} kcal</div>
                        </div>
                      </td>

                      <td className="py-4 px-4 hidden lg:table-cell max-w-xs">
                        <div className="text-[11px] text-[#6E5F5B] line-clamp-2">
                          {(pizza.ingredients || []).join(", ") || "Artisan toppings"}
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/menu/${pizza.id}`}
                            target="_blank"
                            title="View Public Listing"
                            className="p-2 rounded-xl text-[#6E5F5B] hover:text-[#8E1616] hover:bg-[#8E1616]/10 transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(pizza)}
                            title="Edit Menu Item"
                            className="p-2 rounded-xl text-[#6E5F5B] hover:text-[#190F0E] hover:bg-stone-100 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === pizza.id}
                            onClick={() => handleDelete(pizza)}
                            title="Delete Pizza"
                            className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            {deletingId === pizza.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {editingPizza && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded-3xl border border-[#EBE4D8] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE4D8]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#8E1616] text-white flex items-center justify-center text-sm font-black">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#190F0E]">
                      Edit Menu Item: {editingPizza.name}
                    </h3>
                    <p className="text-[11px] text-[#6E5F5B]">
                      Update pricing, ingredients, and menu item details.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="w-8 h-8 rounded-full border border-[#EBE4D8] flex items-center justify-center text-[#6E5F5B] hover:text-[#190F0E] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#190F0E] uppercase tracking-wider">
                      Pizza Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE4D8] text-xs font-semibold focus:border-[#8E1616] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#190F0E] uppercase tracking-wider">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE4D8] text-xs font-semibold focus:border-[#8E1616] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#190F0E] uppercase tracking-wider">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={editTagline}
                    onChange={(e) => setEditTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE4D8] text-xs font-semibold focus:border-[#8E1616] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#190F0E] uppercase tracking-wider">
                      Crust Style
                    </label>
                    <select
                      value={editCrust}
                      onChange={(e) => setEditCrust(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE4D8] text-xs font-semibold focus:border-[#8E1616] focus:outline-hidden bg-white"
                    >
                      {CRUST_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#190F0E] uppercase tracking-wider">
                      Menu Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE4D8] text-xs font-semibold focus:border-[#8E1616] focus:outline-hidden bg-white"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#190F0E] uppercase tracking-wider">
                    Ingredients
                  </label>
                  <textarea
                    rows={2}
                    value={editIngredients}
                    onChange={(e) => setEditIngredients(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE4D8] text-xs font-semibold focus:border-[#8E1616] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#190F0E] uppercase tracking-wider">
                    Story / Description
                  </label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE4D8] text-xs font-semibold focus:border-[#8E1616] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#190F0E] uppercase tracking-wider">
                      Prep Time
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={editPrepTime}
                      onChange={(e) => setEditPrepTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE4D8] text-xs font-semibold focus:border-[#8E1616] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#190F0E] uppercase tracking-wider">
                      Calories
                    </label>
                    <input
                      type="number"
                      min="200"
                      max="2500"
                      value={editCalories}
                      onChange={(e) => setEditCalories(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE4D8] text-xs font-semibold focus:border-[#8E1616] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EBE4D8] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    className="px-4 py-2.5 rounded-xl border border-[#EBE4D8] text-xs font-bold text-[#6E5F5B] hover:bg-stone-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-6 py-2.5 rounded-xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-extrabold flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Update Menu Item</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
