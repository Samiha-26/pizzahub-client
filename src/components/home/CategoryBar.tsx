"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Flame } from "lucide-react";

export const CATEGORIES = [
  { id: "all", name: "Woodfire Pizza", filterParam: "all", icon: "🍕" },
  { id: "veg", name: "Vegetarian", filterParam: "Vegetarian Pizzas", icon: "🥦" },
  { id: "meat", name: "Meat Lovers", filterParam: "Meat Lovers", icon: "🥓" },
  { id: "gourmet", name: "Specialty / Gourmet", filterParam: "Specialty / Gourmet Pizzas", icon: "👑" },
  { id: "sides", name: "Sides & Appetizers", filterParam: "Sides & Appetizers", icon: "🥖" },
  { id: "desserts", name: "Desserts & Drinks", filterParam: "Beverages & Desserts", icon: "🥤" },
];

export default function CategoryBar() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");

  const handleSelect = (cat: typeof CATEGORIES[0]) => {
    setActiveCategory(cat.id);
    if (cat.filterParam === "all") {
      router.push("/menu");
    } else {
      router.push(`/menu?category=${encodeURIComponent(cat.filterParam)}`);
    }
  };

  return (
    <section className="space-y-3">
      {/* Header: Crust & Styles with 6 Curated Lines link (Exact SS Layout) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🍕</span>
          <h2 className="font-extrabold text-sm sm:text-base text-[#190F0E]">
            Crust & Styles
          </h2>
        </div>
        <Link
          href="/menu"
          className="text-xs font-bold text-[#8E1616] hover:text-[#751111] flex items-center gap-1 group transition"
        >
          <span>6 CURATED LINES</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Horizontal Scrollable Pill Strip (Matching Screenshot #1) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat)}
              className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? "bg-[#190F0E] text-white shadow-xs"
                  : "bg-white border border-[#EFE7DE] text-[#190F0E] hover:border-[#8E1616] hover:text-[#8E1616] hover:bg-[#FAF7F2]"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
