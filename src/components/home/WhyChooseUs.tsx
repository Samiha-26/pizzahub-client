"use client";

import React from "react";
import { Flame, Clock, Award, CheckCircle2 } from "lucide-react";

const VALUE_PROPOSITIONS = [
  {
    id: "wood-fired",
    title: "100% Wood-Fired",
    subtitle: "Stone hearth ovens fired with cured oak and hickory logs for authentic blistered crusts.",
    icon: Flame,
    bgClass: "bg-[#8E1616]/10",
    iconColor: "text-[#8E1616]",
  },
  {
    id: "dough-age",
    title: "48-Hour Cold Fermentation",
    subtitle: "Natural sourdough starter slow-fermented for maximum flavor, light airy structure, and easy digestion.",
    icon: Clock,
    bgClass: "bg-amber-500/10",
    iconColor: "text-amber-700",
  },
  {
    id: "artisans",
    title: "Local Certified Pizzaiolos",
    subtitle: "Handcrafted exclusively by independently verified master bakers across your neighborhood.",
    icon: Award,
    bgClass: "bg-emerald-500/10",
    iconColor: "text-emerald-700",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="space-y-6 pt-4">
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#8E1616]">
          TASTE & INTEGRITY GUARANTEE
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#190F0E] mt-1 tracking-tight">
          Why Choose PizzaHub?
        </h2>
        <p className="text-xs sm:text-sm text-[#6E5F5B] mt-1">
          Food crafted strictly to artisanal standards with zero compromised ingredients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VALUE_PROPOSITIONS.map((prop) => {
          const IconComponent = prop.icon;
          return (
            <div
              key={prop.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`w-11 h-11 rounded-2xl ${prop.bgClass} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <IconComponent className={`w-5 h-5 ${prop.iconColor}`} />
              </div>
              <h3 className="font-extrabold text-sm text-[#190F0E]">
                {prop.title}
              </h3>
              <p className="text-xs text-[#6E5F5B] leading-relaxed">
                {prop.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
