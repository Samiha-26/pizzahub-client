import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft, UtensilsCrossed, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[85vh] bg-[#FAF7F2] flex items-center justify-center py-16 px-4 sm:px-6">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="relative inline-block">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto shadow-inner border border-[#8E1616]/20">
            <span className="text-6xl sm:text-7xl select-none">🍕</span>
          </div>
          <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-[#8E1616] text-white font-black text-xs uppercase tracking-wider shadow-md">
            404 Error
          </div>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#190F0E]/5 text-[#6E5F5B] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#8E1616]" />
            <span>Missing Slice in Hearth</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#190F0E] tracking-tight">
            This Oven Is Empty
          </h1>
          <p className="text-sm text-[#6E5F5B] max-w-md mx-auto leading-relaxed">
            The artisan recipe, order dispatch, or page you were looking for was devoured by pizza enthusiasts, moved to another wood-fired oven, or never fermented.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#8E1616] hover:bg-[#721212] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Artisan Menu</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-stone-100 text-[#190F0E] font-bold text-sm border border-[#EBE4D8] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-[#EBE4D8]">
          <div className="text-xs font-bold text-[#6E5F5B] uppercase tracking-wider mb-3">
            Popular Wood-Fired Styles
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/menu?category=Neapolitan"
              className="px-3 py-1.5 rounded-xl bg-white border border-[#EBE4D8] text-xs font-bold text-[#190F0E] hover:border-[#8E1616] hover:text-[#8E1616] transition-colors"
            >
              Neapolitan
            </Link>
            <Link
              href="/menu?category=New%20York"
              className="px-3 py-1.5 rounded-xl bg-white border border-[#EBE4D8] text-xs font-bold text-[#190F0E] hover:border-[#8E1616] hover:text-[#8E1616] transition-colors"
            >
              New York
            </Link>
            <Link
              href="/menu?category=Detroit"
              className="px-3 py-1.5 rounded-xl bg-white border border-[#EBE4D8] text-xs font-bold text-[#190F0E] hover:border-[#8E1616] hover:text-[#8E1616] transition-colors"
            >
              Detroit Style
            </Link>
            <Link
              href="/menu?category=Sicilian"
              className="px-3 py-1.5 rounded-xl bg-white border border-[#EBE4D8] text-xs font-bold text-[#190F0E] hover:border-[#8E1616] hover:text-[#8E1616] transition-colors"
            >
              Sicilian Square
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
