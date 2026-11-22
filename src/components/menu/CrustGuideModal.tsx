"use client";

import React from "react";
import {
  X,
  Sparkles,
  Flame,
  Clock,
  Droplet,
  Thermometer,
  Wheat,
  Check,
  ChevronRight,
} from "lucide-react";

interface CrustStyle {
  name: string;
  categoryFilter: string;
  tagline: string;
  hydration: string;
  fermentation: string;
  ovenTemp: string;
  flour: string;
  description: string;
  characteristics: string[];
}

const CRUST_STYLES: CrustStyle[] = [
  {
    name: "Neapolitan Canotto",
    categoryFilter: "Neapolitan 48h",
    tagline: "48-Hour Cold Bulk Fermentation",
    hydration: "68% - 70%",
    fermentation: "48 Hours",
    ovenTemp: "900°F (480°C)",
    flour: "Caputo Tipo 00",
    description: "The gold standard of Naples. High hydration dough yielding a pillowy, cloud-like cornicione (rim) with dark leopard-spot charring from hardwood flames.",
    characteristics: [
      "Melt-in-mouth soft interior crumb",
      "Wood-fired leopard spots (maculatura)",
      "90-second bake time on refractory stone",
    ],
  },
  {
    name: "New York Street Heritage",
    categoryFilter: "Roman Thin Crust",
    tagline: "72-Hour Slow Cold Proof",
    hydration: "62% - 64%",
    fermentation: "72 Hours",
    ovenTemp: "575°F (300°C)",
    flour: "High-Gluten Spring Wheat",
    description: "Classic Manhattan street slice. Enriched with a hint of olive oil and barley malt for a blistered golden-brown base that holds its signature triangular fold.",
    characteristics: [
      "Signature crisp bottom with zero slice sag",
      "Chewy, pliable interior structure",
      "Foldable street style slice",
    ],
  },
  {
    name: "Detroit Steel Pan",
    categoryFilter: "Detroit Pan",
    tagline: "Double-Proofed in Blue Steel",
    hydration: "74% - 76%",
    fermentation: "36 Hours",
    ovenTemp: "525°F (275°C)",
    flour: "High-Protein Bread Flour",
    description: "Square automotive steel pans forged in Motor City. Proofed directly in seasoned pans with Wisconsin brick cheese pushed to the steel edge creating a caramelized frico crust.",
    characteristics: [
      "Caramelized crispy cheese crown (frico)",
      "Airy, focaccia-like honeycomb interior",
      "Ladle-striped sweet tomato sauce on top",
    ],
  },
  {
    name: "Sourdough Stuffed Edge",
    categoryFilter: "Sourdough Stuffed",
    tagline: "Wild Yeast Levain Starter",
    hydration: "72%",
    fermentation: "36 Hours",
    ovenTemp: "650°F (345°C)",
    flour: "Stoneground Whole Grain & 00",
    description: "Naturally leavened with our 10-year-old mother starter. Rich in complex lactic acid aromatics, baked with creamy ricotta and fior di latte rolled into the rim.",
    characteristics: [
      "Deeply aromatic sourdough tang",
      "Stuffed ricotta and mozzarella cornicione",
      "Easily digestible long fermentation",
    ],
  },
  {
    name: "Gluten-Free Artisanal",
    categoryFilter: "Gluten-Free Cauliflower",
    tagline: "Ancient Grain Hearth Blend",
    hydration: "70%",
    fermentation: "24 Hours",
    ovenTemp: "600°F (315°C)",
    flour: "Milled Rice, Tapioca & Buckwheat",
    description: "Zero wheat, absolute indulgence. Crafted from stoneground ancient grain flours and extra virgin olive oil to deliver authentic blistering and crisp structural integrity.",
    characteristics: [
      "100% wheat-free and certified gluten-free",
      "Golden crispy bottom with light crumb",
      "Naturally leavened for genuine taste",
    ],
  },
];

interface CrustGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCrust: (crustName: string) => void;
}

export default function CrustGuideModal({
  isOpen,
  onClose,
  onSelectCrust,
}: CrustGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#1A1110] rounded-3xl shadow-2xl border border-[#EBE4D8] dark:border-[#2D1E1B] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE4D8] dark:border-[#2D1E1B] bg-[#FAF7F2] dark:bg-[#1E1413]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#8E1616]/10 text-[#8E1616] dark:text-[#E25C5C] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#190F0E] dark:text-white">
                Artisan Crust &amp; Hydration Guide
              </h2>
              <p className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
                Master the fermentation science behind our refractory stone-baked styles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-[#251715] text-[#6E5F5B] dark:text-zinc-400 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CRUST_STYLES.map((style) => (
              <div
                key={style.name}
                className="bg-[#FAF7F2]/60 dark:bg-[#1E1413]/60 rounded-2xl p-5 border border-[#EBE4D8] dark:border-[#2D1E1B] flex flex-col justify-between space-y-4 hover:border-[#8E1616]/30 dark:hover:border-[#E25C5C]/40 transition-all hover:shadow-xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8E1616] dark:text-[#E25C5C]">
                        {style.tagline}
                      </span>
                      <h3 className="text-base font-black text-[#190F0E] dark:text-white group-hover:text-[#8E1616] dark:group-hover:text-[#E25C5C] transition-colors">
                        {style.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 leading-relaxed">
                    {style.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EBE4D8]/80 dark:border-[#2D1E1B] text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#190F0E] dark:text-zinc-200">
                      <Droplet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-bold">{style.hydration} Hydration</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#190F0E] dark:text-zinc-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-bold">{style.fermentation}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#190F0E] dark:text-zinc-200">
                      <Thermometer className="w-3.5 h-3.5 text-[#8E1616] dark:text-[#E25C5C] shrink-0" />
                      <span className="font-bold">{style.ovenTemp}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#190F0E] dark:text-zinc-200">
                      <Wheat className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="font-bold truncate">{style.flour}</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 pt-2 border-t border-[#EBE4D8]/80 dark:border-[#2D1E1B]">
                    {style.characteristics.map((char, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-1.5 text-[11px] text-[#6E5F5B] dark:text-zinc-400"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCrust(style.categoryFilter);
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#251715] hover:bg-[#8E1616] dark:hover:bg-[#8E1616] hover:text-white dark:hover:text-white border border-[#EBE4D8] dark:border-[#3D2824] text-xs font-bold text-[#190F0E] dark:text-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group-hover:border-[#8E1616]"
                >
                  <span>Filter Menu by this Style</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
