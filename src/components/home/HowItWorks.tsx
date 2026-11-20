import React from "react";
import Link from "next/link";
import { Flame, ChefHat, Truck, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Choose Craving & Crust",
      desc: "Select your preferred crust fermentation—from 48-hour cold-fermented Neapolitan to crispy Roman thin base—and top with imported San Marzano tomatoes and fior di latte.",
      tags: ["48h Cold Ferment", "San Marzano D.O.P."],
      icon: ChefHat,
    },
    {
      num: "02",
      title: "Live 450°C Stone Crafting",
      desc: "Master pizzaiolos hand-stretch, sauce, and bake your pie on refractory stone inside beechwood-fired ovens in under 90 seconds to create signature leopard-spotted cornicione.",
      tags: ["450°C Beechwood Hearth", "90s Flash Bake"],
      icon: Flame,
    },
    {
      num: "03",
      title: "Fast Contactless Delivery",
      desc: "Packed straight into micro-vented thermal boxes that allow moisture to escape while trapping blistering heat, dispatched hot to your doorstep.",
      tags: ["Vented Thermal Box", "Contactless Direct"],
      icon: Truck,
    },
  ];

  return (
    <section className="bg-[#FDFBF7] rounded-3xl p-6 sm:p-10 border border-[#EFE7DE] shadow-xs relative overflow-hidden">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8E1616]/10 border border-[#8E1616]/15 text-xs font-semibold text-[#8E1616]">
            <Sparkles className="w-3.5 h-3.5 text-[#8E1616]" />
            <span>AFTER OVEN CLICKS</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#190F0E] tracking-tight leading-tight">
              How PizzaHub Works
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5F5B] leading-relaxed">
              Three seamless steps from stone hearth craving to doorstep bubbling delivery. Handcrafted to order with zero compromised ingredients.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EFE7DE] shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-[#190F0E] font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Hand-stretched per order by certified pizzaiolos</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#190F0E] font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-time kitchen dispatch tracking updates</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#190F0E] font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dedicated thermal-insulated bike couriers</span>
            </div>
          </div>

          <div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8E1616] hover:bg-[#731212] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm shadow-[#8E1616]/20 hover:-translate-y-0.5"
            >
              <span>Explore The Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4 relative">
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-[#EFE7DE] hidden sm:block" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-[#EFE7DE] shadow-xs hover:border-[#8E1616]/30 hover:shadow-sm transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#8E1616] text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs ring-4 ring-[#FDFBF7] z-10">
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-base text-[#190F0E]">
                      {step.title}
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-[#8E1616] bg-[#8E1616]/10 px-2.5 py-0.5 rounded-full">
                      STEP {step.num}
                    </span>
                  </div>

                  <p className="text-xs text-[#6E5F5B] leading-relaxed">
                    {step.desc}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-[#6E5F5B] bg-[#FAF7F2] border border-[#EFE7DE] px-2.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
