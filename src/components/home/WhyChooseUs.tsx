import React from "react";
import { Flame, Bike, ShieldCheck } from "lucide-react";

export const VALUE_PROPOSITIONS = [
  {
    id: "stone-baked",
    title: "450°C Stone-Baked Authenticity",
    description:
      "Every approved pizzeria deploys authentic refractory stone ovens reaching 450°C for signature crispy-airy blister spots in under 90 seconds.",
    icon: Flame,
    bgClass: "bg-[#FFF4E5]",
    iconColor: "text-[#D97706]",
  },
  {
    id: "fast-track",
    title: "30-Min Fast-Track Dispatch",
    description:
      "Dedicated thermal-insulated heated transport bags ensure your pizza arrives piping hot, preserving molecular crumb elasticity without sogginess.",
    icon: Bike,
    bgClass: "bg-[#FEE2E2]",
    iconColor: "text-[#8E1616]",
  },
  {
    id: "satisfaction",
    title: "Guaranteed Fresh Ingredients",
    description:
      "Zero synthetic additives, 100% true buffalo mozzarella, seasonal D.O.P. tomatoes, and a full satisfaction replacement pledge on orders.",
    icon: ShieldCheck,
    bgClass: "bg-emerald-100",
    iconColor: "text-emerald-700",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="space-y-6 pt-4">
      {/* Section Eyebrow & Headers */}
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

      {/* 3 Pillars Grid */}
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
              <h3 className="font-extrabold text-sm sm:text-base text-[#190F0E] leading-snug">
                {prop.title}
              </h3>
              <p className="text-xs text-[#6E5F5B] leading-relaxed">
                {prop.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
