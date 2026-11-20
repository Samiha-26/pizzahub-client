"use client";

import React, { useState } from "react";
import Link from "next/link";
import PizzaCard, { type PizzaItem } from "@/components/shared/PizzaCard";
import { SlidersHorizontal, ArrowRight, CheckCircle2 } from "lucide-react";

export const FEATURED_SPECIALS: PizzaItem[] = [
  {
    id: "p1",
    itemName: "Truffle Burrata Prosciutto",
    category: "SPECIALTY / GOURMET",
    description: "Fresh fior di latte base, aged Prosciutto di Parma, black summer truffle cremita, baby arugula leaves.",
    price: 18.50,
    location: "Brooklyn, NY",
    vendorName: "Napoli Hearth Masters",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    badge: "IN PREMIUM WOOD-FIRE",
    badgeType: "premium",
    timeEstimate: "25–35 min",
  },
  {
    id: "p2",
    itemName: "Fiery Diavola Pepperoni",
    category: "MEAT LOVERS",
    description: "Crisped spicy pepperoni cups, smoked scamorza cheese, wild Calabrian chili paste, clover honey drizzle.",
    price: 19.90,
    location: "Little Italy, NY",
    vendorName: "Little Italy Ovens",
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop&q=80",
    badge: "TOP RE-ORDERED",
    badgeType: "top",
    timeEstimate: "20 min",
  },
  {
    id: "p3",
    itemName: "Artisan Margherita DOC",
    category: "CLASSIC / VEGETARIAN",
    description: "Campania buffalo mozzarella, hand-crushed D.O.P. tomatoes, fresh sweet basil, cold-pressed olive oil.",
    price: 14.25,
    location: "Lower Manhattan, NY",
    vendorName: "Napoli Hearth Masters",
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80",
    badge: "IN PREMIUM WOOD-FIRE",
    badgeType: "premium",
    timeEstimate: "18 min",
  },
  {
    id: "p4",
    itemName: "Smoked BBQ Brisket Pizza",
    category: "MEAT LOVERS",
    description: "14-hour oak-smoked low & slow pulled brisket, caramelized shallots, house BBQ glaze reduction.",
    price: 19.50,
    location: "Williamsburg, NY",
    vendorName: "Smoke & Crust Wood Lab",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
    badge: "TOP RE-ORDERED",
    badgeType: "top",
    timeEstimate: "25–35 min",
  },
  {
    id: "p5",
    itemName: "Wild Faux-Mushroom Bianco",
    category: "VEGETARIAN / BIANCO",
    description: "Crushed garlic confit base, roasted king oyster & cremini mushrooms, fontina cheese, white truffle fonduta.",
    price: 17.40,
    location: "Greenpoint, NY",
    vendorName: "Greenpoint Woodfire",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80",
    badge: "IN PREMIUM WOOD-FIRE",
    badgeType: "premium",
    timeEstimate: "18–24 min",
  },
  {
    id: "p6",
    itemName: "Crispy Garlic Parmesan Knots",
    category: "SIDES & APPETIZERS",
    description: "Hand-tied dough knots baked in refractory stone, tossed in hot garlic butter, 24-month aged pecorino, marinara pot.",
    price: 8.95,
    location: "Brooklyn, NY",
    vendorName: "Brooklyn Crust Co.",
    image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800&auto=format&fit=crop&q=80",
    badge: "IN PREMIUM WOOD-FIRE",
    badgeType: "premium",
    timeEstimate: "12–16 min",
  },
];

export default function ArtisanChefSpecials() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddToCart = (item: PizzaItem) => {
    setToastMessage(`Added 1x ${item.itemName} to your order!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <section className="space-y-4 pt-2">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#190F0E] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-[#8E1616] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Section Header (Matching Screenshot #1) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#190F0E] tracking-tight">
            Artisan Chef Specials
          </h2>
          <p className="text-xs text-[#6E5F5B] mt-0.5">
            Oven-blistered sourdough, fromage cheeses & fresh herbs
          </p>
        </div>

        <Link
          href="/menu"
          className="text-xs font-bold text-[#8E1616] hover:text-[#751111] flex items-center gap-1 group self-start sm:self-auto transition"
        >
          <span>View Full Catalog</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 6 Responsive Pizza Cards Grid (Option B Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {FEATURED_SPECIALS.map((pizza) => (
          <PizzaCard
            key={pizza.id}
            item={pizza}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </section>
  );
}
