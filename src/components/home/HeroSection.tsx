"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/menu");
    }
  };

  return (
    <section className="relative overflow-hidden py-8 sm:py-12 text-center max-w-4xl mx-auto space-y-6">
      
      {/* Top Flare Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FEE2E2] text-[#8E1616] text-[11px] font-black uppercase tracking-wider border border-[#FECACA] shadow-xs">
        <Flame className="w-3.5 h-3.5 text-[#8E1616] animate-pulse" />
        <span>A Fire-Infused Taste Sensation</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#190F0E] leading-[1.1] tracking-tight">
        Hot & Fresh Pizza <br />
        <span className="text-[#8E1616]">Delivered to Your Door</span>
      </h1>

      {/* Short Description */}
      <p className="text-xs sm:text-sm text-[#6E5F5B] max-w-xl mx-auto leading-relaxed">
        Incredible blistered crusts, cold-fermented doughs, and organic farm-fresh produce from authenticated local pizzerias.
      </p>

      {/* Hero Search Box */}
      <form
        onSubmit={handleSearch}
        className="max-w-lg mx-auto p-1.5 bg-white rounded-2xl border border-[#EFE7DE] shadow-md flex items-center gap-2 transition focus-within:border-[#8E1616]"
      >
        <span className="pl-3.5 text-gray-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for neapolitan, hot honey burrata, vegan..."
          className="w-full text-xs sm:text-sm bg-transparent outline-none py-2 text-[#190F0E] placeholder:text-gray-400"
        />
        <Button
          type="submit"
          variant="crimson"
          size="default"
          className="shrink-0 flex items-center gap-1.5 px-4 sm:px-5"
        >
          <span>Explore Menu</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </form>

      {/* Quick Trust Highlights */}
      <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#6E5F5B]">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-[#190F0E]">150+</span>
          <span>Woodfire Ovens</span>
        </div>
        <div className="h-3 w-px bg-[#EFE7DE] hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="font-black text-[#190F0E]">28 min</span>
          <span>Avg. Dispatch</span>
        </div>
        <div className="h-3 w-px bg-[#EFE7DE] hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="font-black text-amber-600">★ 4.9</span>
          <span>(25,000+ Reviews)</span>
        </div>
      </div>
    </section>
  );
}
