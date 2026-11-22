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
  Sparkles,
} from "lucide-react";
import PizzaCard, { type PizzaItem } from "@/components/shared/PizzaCard";
import { getMenu } from "@/lib/api";
import { ALL_PIZZAS_CATALOG } from "@/data/catalogPizzas";
import CrustGuideModal from "@/components/menu/CrustGuideModal";
import { useCart } from "@/context/CartContext";

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
  const { addItem } = useCart();

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialCrust = searchParams.get("crust") || "All";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCrust, setSelectedCrust] = useState(initialCrust);
  const [sortBy, setSortBy] = useState("newest");
  const [isCrustGuideOpen, setIsCrustGuideOpen] = useState(false);

  const [items, setItems] = useState<PizzaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory("All");
    }
    const cr = searchParams.get("crust");
    if (cr) {
      setSelectedCrust(cr);
    } else {
      setSelectedCrust("All");
    }
    const q = searchParams.get("search");
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      setIsLoading(true);

      const res = await getMenu({
        search: searchTerm,
        category: selectedCategory,
        crust: selectedCrust,
        sort: sortBy,
        limit: 60,
      });

      if (!isMounted) return;

      if (res.items.length > 0) {
        setItems(res.items);
        setTotal(res.total);
      } else {
        let filtered = [...ALL_PIZZAS_CATALOG];
        if (searchTerm.trim()) {
          const lower = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.itemName.toLowerCase().includes(lower) ||
              p.description.toLowerCase().includes(lower) ||
              p.vendorName.toLowerCase().includes(lower)
          );
        }
        if (selectedCategory && selectedCategory !== "All") {
          const lowerCat = selectedCategory.toLowerCase();
          filtered = filtered.filter((p) =>
            p.category.toLowerCase().includes(lowerCat) ||
            lowerCat.includes(p.category.toLowerCase())
          );
        }
        if (selectedCrust && selectedCrust !== "All") {
          const lowerCrust = selectedCrust.toLowerCase();
          filtered = filtered.filter((p) =>
            p.crust.toLowerCase().includes(lowerCrust) ||
            lowerCrust.includes(p.crust.toLowerCase())
          );
        }
        if (sortBy === "price-asc") {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
          filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating-desc") {
          filtered.sort((a, b) => b.rating - a.rating);
        }
        setItems(filtered);
        setTotal(filtered.length);
      }

      setIsLoading(false);
    }

    const timer = setTimeout(() => {
      loadMenu();
    }, 150);

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
    addItem({
      id: item.id,
      name: item.itemName,
      price: item.price,
      image: item.image,
      category: item.category,
      vendorName: item.vendorName,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-[#6E5F5B] dark:text-zinc-400">
          <Link href="/" className="hover:text-[#8E1616] dark:hover:text-[#E25C5C] transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#190F0E] dark:text-white font-bold">Artisan Menu</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] dark:text-white tracking-tight">
              Artisan Wood-Fired Menu
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5F5B] dark:text-zinc-400 mt-0.5">
              Refractory stone hearth pies, 48-hour dough fermentations, and imported Italian toppings
            </p>
          </div>

          <div className="text-xs font-bold text-[#8E1616] dark:text-[#E25C5C] bg-[#8E1616]/10 dark:bg-[#8E1616]/20 px-3 py-1.5 rounded-full self-start sm:self-auto shrink-0">
            {total} {total === 1 ? "Pizza Available" : "Pizzas Available"}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1110] rounded-3xl border border-[#EFE7DE] dark:border-[#2D1E1B] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by pizza name, sauce, or ingredients (e.g. 'Nduja, Truffle, Burrata)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EFE7DE] dark:border-[#2D1E1B] text-xs text-[#190F0E] dark:text-white focus:outline-none focus:border-[#8E1616] transition bg-[#FAF7F2]/50 dark:bg-[#1E1413] placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <select
                value={selectedCrust}
                onChange={(e) => setSelectedCrust(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#EFE7DE] dark:border-[#2D1E1B] text-xs font-semibold text-[#190F0E] dark:text-zinc-200 bg-white dark:bg-[#1E1413] focus:outline-none focus:border-[#8E1616] transition appearance-none cursor-pointer"
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
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#EFE7DE] dark:border-[#2D1E1B] text-xs font-semibold text-[#190F0E] dark:text-zinc-200 bg-white dark:bg-[#1E1413] focus:outline-none focus:border-[#8E1616] transition appearance-none cursor-pointer"
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
                className="p-2.5 rounded-2xl border border-[#EFE7DE] dark:border-[#2D1E1B] hover:bg-[#FAF7F2] dark:hover:bg-[#251715] text-xs text-[#8E1616] dark:text-[#E25C5C] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          <button
            type="button"
            onClick={() => setIsCrustGuideOpen(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Crust &amp; Hydration Guide</span>
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#8E1616] text-white shadow-xs"
                  : "bg-[#FAF7F2] dark:bg-[#1E1413] text-[#6E5F5B] dark:text-zinc-300 hover:text-[#190F0E] dark:hover:text-white hover:bg-[#EFE7DE] dark:hover:bg-[#251715]"
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
          <p className="text-xs font-bold text-[#6E5F5B] dark:text-zinc-400">
            Firing stone ovens &amp; fetching artisan menu...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-[#1A1110] rounded-3xl border border-[#EFE7DE] dark:border-[#2D1E1B] p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF7F2] dark:bg-[#1E1413] border border-[#EFE7DE] dark:border-[#2D1E1B] flex items-center justify-center mx-auto text-2xl">
            🍕
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#190F0E] dark:text-white">
              No Artisan Pizzas Found
            </h3>
            <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 max-w-xs mx-auto">
              We couldn't find any wood-fired creations matching your current filters. Try relaxing your search criteria.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-2xl bg-[#8E1616] text-white text-xs font-bold hover:bg-[#731212] transition shadow-sm cursor-pointer"
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

      <CrustGuideModal
        isOpen={isCrustGuideOpen}
        onClose={() => setIsCrustGuideOpen(false)}
        onSelectCrust={(crustFilter) => setSelectedCrust(crustFilter)}
      />
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
