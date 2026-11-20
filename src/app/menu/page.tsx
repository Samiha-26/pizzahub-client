"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Search,
  SlidersHorizontal,
  Flame,
  RotateCcw,
  Loader2,
  ChevronRight,
  Pizza,
} from "lucide-react";
import PizzaCard, { type PizzaItem } from "@/components/shared/PizzaCard";
import { getMenu } from "@/lib/api";
import { FALLBACK_SPECIALS } from "@/components/home/ArtisanChefSpecials";

const CATEGORIES = [
  "All",
  "Wood-Fired",
  "Classic Italian",
  "White Base",
  "Spicy & Fiery",
  "Vegetarian & Plant",
];

const CRUST_TYPES = [
  "All",
  "Neapolitan 48h",
  "Roman Thin Crust",
  "Detroit Pan",
  "Gluten-Free Cauliflower",
  "Sourdough Stuffed",
];

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialCrust = searchParams.get("crust") || "All";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCrust, setSelectedCrust] = useState(initialCrust);
  const [sortBy, setSortBy] = useState("newest");

  const [items, setItems] = useState<PizzaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      setIsLoading(true);

      const res = await getMenu({
        search: searchTerm,
        category: selectedCategory,
        crust: selectedCrust,
        sort: sortBy,
      });

      if (!isMounted) return;

      if (res.items.length > 0) {
        setItems(res.items);
        setTotal(res.total);
      } else if (!searchTerm && selectedCategory === "All" && selectedCrust === "All") {
        setItems(FALLBACK_SPECIALS);
        setTotal(FALLBACK_SPECIALS.length);
      } else {
        setItems([]);
        setTotal(0);
      }

      setIsLoading(false);
    }

    const timer = setTimeout(() => {
      loadMenu();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedCategory, selectedCrust, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedCrust("All");
    setSortBy("newest");
    router.replace("/menu");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedCrust !== "All" ||
    sortBy !== "newest";

  const handleAddToCart = (item: PizzaItem) => {
    toast.success(`Added 1x ${item.itemName} to your cart!`, {
      icon: "🍕",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-[#6E5F5B]">
          <Link href="/" className="hover:text-[#8E1616] transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#190F0E] font-bold">Artisan Menu</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] tracking-tight">
              Artisan Wood-Fired Menu
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5F5B] mt-0.5">
              Refractory stone hearth pies, 48-hour dough fermentations, and imported Italian toppings
            </p>
          </div>

          <div className="text-xs font-bold text-[#8E1616] bg-[#8E1616]/10 px-3 py-1.5 rounded-full self-start sm:self-auto shrink-0">
            {total} {total === 1 ? "Pizza Available" : "Pizzas Available"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#EFE7DE] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by pizza name, sauce, or ingredients (e.g. 'Nduja, Truffle, Burrata)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EFE7DE] text-xs text-[#190F0E] focus:outline-none focus:border-[#8E1616] transition bg-[#FAF7F2]/50 placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <select
                value={selectedCrust}
                onChange={(e) => setSelectedCrust(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#EFE7DE] text-xs font-semibold text-[#190F0E] bg-white focus:outline-none focus:border-[#8E1616] transition appearance-none cursor-pointer"
              >
                <option value="All">All Crust Fermentations</option>
                {CRUST_TYPES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#EFE7DE] text-xs font-semibold text-[#190F0E] bg-white focus:outline-none focus:border-[#8E1616] transition appearance-none cursor-pointer"
              >
                <option value="newest">Newest Creations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2.5 rounded-2xl border border-[#EFE7DE] hover:bg-[#FAF7F2] text-xs text-[#8E1616] font-bold transition flex items-center gap-1 shrink-0"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-[#8E1616] text-white shadow-xs"
                  : "bg-[#FAF7F2] text-[#6E5F5B] hover:text-[#190F0E] hover:bg-[#EFE7DE]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#8E1616]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs font-bold text-[#6E5F5B]">
            Firing stone ovens &amp; fetching artisan menu...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EFE7DE] p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EFE7DE] flex items-center justify-center mx-auto text-2xl">
            🍕
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#190F0E]">
              No Artisan Pizzas Found
            </h3>
            <p className="text-xs text-[#6E5F5B] max-w-xs mx-auto">
              We couldn't find any wood-fired creations matching your current filters. Try relaxing your search criteria.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-2xl bg-[#8E1616] text-white text-xs font-bold hover:bg-[#731212] transition shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((pizza) => (
            <PizzaCard
              key={pizza.id}
              item={pizza}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center text-[#8E1616] gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-xs font-bold">Loading artisan catalog...</span>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
