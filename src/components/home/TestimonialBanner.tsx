import React from "react";
import { Star, Quote, Award, Sparkles, CheckCircle } from "lucide-react";

export default function TestimonialBanner() {
  const metrics = [
    { label: "On-Time Dispatch", value: "99.4%", sub: "Guaranteed thermal heat" },
    { label: "Woodfire Temp", value: "450°C", sub: "Stone hearth blister" },
    { label: "Average Rating", value: "4.9 / 5.0", sub: "25,000+ verified foodies" },
    { label: "Dispatch Window", value: "< 30 min", sub: "Dedicated bike couriers" },
  ];

  return (
    <section className="space-y-6 pt-2">
      <div className="bg-gradient-to-br from-white via-[#FAF7F2] to-[#FDFBF7] dark:from-[#1A1110] dark:via-[#160D0C] dark:to-[#120B0A] rounded-3xl p-6 sm:p-10 border border-[#EFE7DE] dark:border-[#2D1E1B] shadow-xs relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8E1616]/10 border border-[#8E1616]/15 text-xs font-semibold text-[#8E1616] dark:text-[#E25C5C]">
            <Award className="w-3.5 h-3.5 text-[#8E1616] dark:text-[#E25C5C]" />
            <span>CRITICALLY ACCLAIMED CRUST</span>
          </div>

          <div className="flex justify-center items-center gap-1.5 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-xs font-bold text-[#190F0E] dark:text-zinc-200">
              4.9 / 5.0 (25,000+ Reviews)
            </span>
          </div>

          <div className="relative">
            <Quote className="w-10 h-10 text-[#8E1616]/15 dark:text-[#E25C5C]/20 mx-auto mb-2" />
            <blockquote className="text-lg sm:text-2xl font-black text-[#190F0E] dark:text-white tracking-tight leading-snug">
              &ldquo;The only delivery platform consistently protecting the blistered cornicione. Arrives sizzling hot, zero sogginess, and true Italian heritage in every single slice.&rdquo;
            </blockquote>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#8E1616] text-white font-bold flex items-center justify-center shadow-xs">
              SD
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-[#190F0E] dark:text-white">Sofia De Luca</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs text-[#6E5F5B] dark:text-zinc-400">
                Culinary Editor &amp; Certified Neapolitan Pizza Judge
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#EFE7DE] dark:border-[#2D1E1B] grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {metrics.map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-[#8E1616] dark:text-[#E25C5C]">
                  {m.value}
                </div>
                <div className="text-xs font-bold text-[#190F0E] dark:text-white">
                  {m.label}
                </div>
                <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
                  {m.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
