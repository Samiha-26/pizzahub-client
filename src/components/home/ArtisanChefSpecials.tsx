"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import PizzaCard, { type PizzaItem } from "@/components/shared/PizzaCard";
import { ArrowRight, Loader2 } from "lucide-react";
import { getChefSpecials } from "@/lib/api";

export const FALLBACK_SPECIALS: PizzaItem[] = [
  {
    id: "p1",
    itemName: "Diavola Con 'Nduja",
    category: "WOOD-FIRED",
    description: "Fiery Calabrian sausage spread, fermented crushed chilies, fresh fior di latte mozzarella, raw wildflower chili honey drizzle, and charred Roman basil.",
    price: 18.50,
    location: "Little Italy, Manhattan, NY",
    vendorName: "Forno Antico Pizzeria",
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop&q=80",
    badge: "IN PREMIUM WOOD-FIRE",
    badgeType: "premium",
    timeEstimate: "14 min",
  },
  {
    id: "p2",
    itemName: "Truffle Porcini Bianco",
    category: "WHITE BASE",
    description: "Velvety black summer truffle crema, pan-seared wild porcini mushrooms, creamy taleggio, smoked provolone, and fresh thyme on 48h sourdough base.",
    price: 22.00,
    location: "Williamsburg, Brooklyn, NY",
    vendorName: "L'Antica Forneria",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    badge: "CHEF RECOMMENDED",
    badgeType: "top",
    timeEstimate: "16 min",
  },
  {
    id: "p3",
    itemName: "Margherita D.O.P. di Bufala",
    category: "CLASSIC ITALIAN",
    description: "Certified Campanian buffalo mozzarella, volcanic San Marzano tomatoes, freshly plucked sweet Genovese basil, and cold-pressed extra virgin olive oil.",
    price: 16.00,
    location: "Little Italy, Manhattan, NY",
    vendorName: "Forno Antico Pizzeria",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80",
    badge: "IN PREMIUM WOOD-FIRE",
    badgeType: "premium",
    timeEstimate: "12 min",
  },
  {
    id: "p4",
    itemName: "Quattro Formaggi al Miele",
    category: "WHITE BASE",
    description: "Gorgonzola piccante, 24-month aged Parmigiano Reggiano, fontina val d'Aosta, and fresh fior di latte drizzled with raw acacia honey and crushed walnuts.",
    price: 19.50,
    location: "North Beach, San Francisco, CA",
    vendorName: "Pizzeria Napoletana",
    image: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80",
    badge: "SWEET & SAVORY",
    badgeType: "top",
    timeEstimate: "15 min",
  },
  {
    id: "p5",
    itemName: "Smoked Burrata & Prosciutto",
    category: "CLASSIC ITALIAN",
    description: "20-month aged Prosciutto di Parma laid over whole smoked Pugliese burrata, wild baby arugula, shaved pecorino romano, and balsamic glaze reduction.",
    price: 24.00,
    location: "Williamsburg, Brooklyn, NY",
    vendorName: "L'Antica Forneria",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
    badge: "IN PREMIUM WOOD-FIRE",
    badgeType: "premium",
    timeEstimate: "15 min",
  },
  {
    id: "p6",
    itemName: "Fiery Calabrian Salami & Peppers",
    category: "SPICY & FIERY",
    description: "Artisan soppressata salami, flame-charred sweet red bell peppers, smoked scamorza, oregano, and chili flakes on fermented dough with garlic crust.",
    price: 17.00,
    location: "North Beach, San Francisco, CA",
    vendorName: "Pizzeria Napoletana",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80",
    badge: "TOP RE-ORDERED",
    badgeType: "top",
    timeEstimate: "13 min",
  },
];

export default function ArtisanChefSpecials() {
  const [specials, setSpecials] = useState<PizzaItem[]>(FALLBACK_SPECIALS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveSpecials() {
      setIsLoading(true);
      const data = await getChefSpecials();
      if (isMounted && data && data.length > 0) {
        setSpecials(data);
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadLiveSpecials();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (item: PizzaItem) => {
    toast.success(`Added 1x ${item.itemName} to your cart!`, {
      icon: "🍕",
    });
  };

  return (
    <section className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#190F0E] tracking-tight">
            Artisan Chef Specials
          </h2>
          <p className="text-xs text-[#6E5F5B] mt-0.5">
            Oven-blistered sourdough, D.O.P. cheeses &amp; freshly plucked herbs
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

      {isLoading && specials.length === 0 ? (
        <div className="py-12 flex justify-center items-center text-[#8E1616] gap-2 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Firing up the hearth...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {specials.map((pizza) => (
            <PizzaCard
              key={pizza.id}
              item={pizza}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}
