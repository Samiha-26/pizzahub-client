"use client";

import React from "react";
import Link from "next/link";
import { Clock, Store, ShoppingBag, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PizzaItem {
  id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  vendorName: string;
  image: string;
  badge?: string;
  badgeType?: "premium" | "top";
  timeEstimate?: string;
}

interface PizzaCardProps {
  item: PizzaItem;
  onAddToCart?: (item: PizzaItem) => void;
}

export default function PizzaCard({ item, onAddToCart }: PizzaCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#EFE7DE] overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#8E1616]/30 group">
      
      {/* Top Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={item.itemName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top-Left Badge (Option B Screenshot exact matching) */}
        {item.badge && (
          <div className="absolute top-2.5 left-2.5">
            {item.badgeType === "top" ? (
              <span className="bg-[#D97706] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                <Flame className="w-3 h-3 fill-white" />
                <span>{item.badge}</span>
              </span>
            ) : (
              <span className="bg-[#FFF4E5] text-[#8E1616] border border-[#FDE2C4] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                <span>🔥</span>
                <span>{item.badge}</span>
              </span>
            )}
          </div>
        )}

        {/* Bottom-Right Time Estimate Pill (Screenshot #1) */}
        {item.timeEstimate && (
          <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{item.timeEstimate}</span>
          </span>
        )}
      </div>

      {/* Card Content Block */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Price Row */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E1616]">
              {item.category}
            </span>
            <span className="text-base sm:text-lg font-black text-[#8E1616]">
              ${item.price.toFixed(2)}
            </span>
          </div>

          {/* Pizza Title */}
          <h3 className="font-extrabold text-base text-[#190F0E] group-hover:text-[#8E1616] transition-colors leading-snug">
            {item.itemName}
          </h3>

          {/* Description */}
          <p className="text-xs text-[#6E5F5B] leading-relaxed line-clamp-2">
            {item.description}
          </p>

          {/* Vendor Line */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#6E5F5B] pt-1">
            <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-semibold text-[#190F0E]">{item.vendorName}</span>
            <span>• {item.location}</span>
          </div>
        </div>

        {/* Action Buttons Row (Screenshot #1: View Details + Red Cart) */}
        <div className="pt-3 border-t border-[#EFE7DE] flex items-center gap-2">
          <Link
            href={`/menu/${item.id}`}
            className="flex-1 py-2 px-3 bg-white border border-[#EFE7DE] hover:bg-[#FAF7F2] hover:border-gray-400 text-[#190F0E] text-xs font-bold rounded-xl transition text-center shadow-2xs"
          >
            View Details
          </Link>

          <Button
            type="button"
            variant="crimson"
            size="icon"
            className="shrink-0 rounded-xl"
            title="Quick add to order"
            onClick={() => onAddToCart && onAddToCart(item)}
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
