"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Flame } from "lucide-react";

export const CATEGORIES = [
  { id: "all", name: "All Pizzas", filterParam: "All", icon: "🍕" },
  { id: "woodfired", name: "Wood-Fired", filterParam: "Wood-Fired", icon: "🔥" },
  { id: "classic", name: "Classic Italian", filterParam: "Classic Italian", icon: "🇮🇹" },
  { id: "white", name: "White Base", filterParam: "White Base", icon: "🧀" },
  { id: "spicy", name: "Spicy & Fiery", filterParam: "Spicy & Fiery", icon: "🌶️" },
  { id: "veg", name: "Vegetarian & Plant", filterParam: "Vegetarian & Plant", icon: "🥦" },
];

export default function CategoryBar() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");

  const handleSelect = (cat: typeof CATEGORIES[0]) => {
    setActiveCategory(cat.id);
    if (cat.filterParam === "All") {
      router.push("/menu");
    } else {
      router.push(`/menu?category=${encodeURIComponent(cat.filterParam)}`);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🍕</span>
          <h2 className="font-extrabold text-sm sm:text-base text-[#190F0E] dark:text-white">
            Crust &amp; Styles
          </h2>
        </div>
        <Link
          href="/menu"
          className="text-xs font-bold text-[#8E1616] dark:text-[#E25C5C] hover:text-[#751111] dark:hover:text-[#F87171] flex items-center gap-1 group transition"
        >
          <span>Explore All Pizzas</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat)}
              className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#190F0E] dark:bg-white text-white dark:text-[#190F0E] shadow-xs"
                  : "bg-white dark:bg-[#1A1110] border border-[#EFE7DE] dark:border-[#2D1E1B] text-[#190F0E] dark:text-zinc-200 hover:border-[#8E1616] dark:hover:border-[#E25C5C] hover:text-[#8E1616] dark:hover:text-[#E25C5C] hover:bg-[#FAF7F2] dark:hover:bg-[#251715]"
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
