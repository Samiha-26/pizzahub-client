"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Flame,
  Sparkles,
  MapPin,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { createOrder } from "@/lib/api";

export default function CartDrawer() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalCount,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bakerNote, setBakerNote] = useState("");

  if (!isCartOpen) return null;
  if ((user as any)?.role === "vendor" || (user as any)?.role === "admin") return null;

  const deliveryFee = subtotal >= 35 || subtotal === 0 ? 0.0 : 3.99;
  const tax = Number((subtotal * 0.08875).toFixed(2));
  const grandTotal = Number((subtotal + deliveryFee + tax).toFixed(2));

  const handleCheckout = async () => {
    if (!user?.email) {
      toast.error("Please sign in to place your artisan order", { icon: "🔒" });
      setIsCartOpen(false);
      router.push("/signin?redirect=/menu");
      return;
    }

    if ((user as any)?.role === "vendor" || (user as any)?.role === "admin") {
      toast.error("Ordering is reserved for customer accounts", { icon: "🛡️" });
      setIsCartOpen(false);
      return;
    }

    const savedAddress =
      typeof window !== "undefined"
        ? localStorage.getItem("pizzahub_delivery_area") || "Little Italy, Manhattan, NY"
        : "Little Italy, Manhattan, NY";

    setIsSubmitting(true);

    try {
      for (const item of items) {
        await createOrder({
          customerEmail: user.email,
          customerName: user.name || "Pizza Enthusiast",
          pizzaId: item.id,
          pizzaName: item.name,
          pizzaImage: item.image,
          price: item.price,
          quantity: item.quantity,
          totalPrice: Number((item.price * item.quantity).toFixed(2)),
          crust: item.crust || "Neapolitan 48h",
          category: item.category || "Wood-Fired",
          vendorId: item.vendorId || "vendor_artisan_01",
          vendorName: item.vendorName || "Forno Antico Pizzeria",
          deliveryAddress: savedAddress,
          deliverySchedule: "ASAP Express Hearth Dispatch",
          bakerNote: bakerNote.trim() || undefined,
        });
      }

      toast.success("Order fired! Preparing your wood-fired pies in the hearth.", {
        icon: "🍕",
        duration: 5000,
      });

      clearCart();
      setIsCartOpen(false);
      router.push("/orders");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#160D0C] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <div className="p-5 border-b border-[#EFE7DE] dark:border-[#2D1E1B] flex items-center justify-between bg-[#FAF7F2] dark:bg-[#1E1413]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#8E1616] text-white flex items-center justify-center text-sm shadow-xs">
                🍕
              </div>
              <div>
                <h2 className="text-sm font-black text-[#190F0E] dark:text-white">Your Artisan Cart</h2>
                <p className="text-[10px] text-[#6E5F5B] dark:text-zinc-400">
                  {totalCount} {totalCount === 1 ? "pie" : "pies"} selected
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-[#251715] text-gray-500 dark:text-zinc-400 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-[#FAF7F2] dark:bg-[#1E1413] border border-[#EFE7DE] dark:border-[#2D1E1B] flex items-center justify-center text-3xl">
                  🛒
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#190F0E] dark:text-white">Your Cart is Empty</h3>
                  <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 max-w-xs mx-auto">
                    You haven&apos;t added any stone-baked creations yet. Explore our cold fermented menu!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/menu");
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Browse Sourdough Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-[#EFE7DE] dark:border-[#2D1E1B] bg-[#FAF7F2]/60 dark:bg-[#1E1413]/60 flex items-center gap-3"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-stone-800 shrink-0 border border-[#EFE7DE] dark:border-[#2D1E1B]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-black text-[#190F0E] dark:text-white truncate">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition p-0.5 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[10px] text-[#6E5F5B] dark:text-zinc-400 truncate">
                        {item.crust || "Neapolitan 48h"}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black text-[#8E1616]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>

                        <div className="flex items-center gap-2 bg-white dark:bg-[#241816] border border-[#EFE7DE] dark:border-[#2D1E1B] px-2 py-0.5 rounded-lg shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-5 h-5 rounded hover:bg-gray-100 dark:hover:bg-[#32201D] flex items-center justify-center text-xs font-bold cursor-pointer text-[#190F0E] dark:text-zinc-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-[#190F0E] dark:text-white min-w-3 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-5 h-5 rounded hover:bg-gray-100 dark:hover:bg-[#32201D] flex items-center justify-center text-xs font-bold cursor-pointer text-[#190F0E] dark:text-zinc-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[11px] text-gray-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                  >
                    Clear All Items
                  </button>
                </div>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-5 border-t border-[#EFE7DE] dark:border-[#2D1E1B] bg-white dark:bg-[#160D0C] space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#190F0E] dark:text-zinc-200 block">
                  Baker Note / Instructions <span className="text-[10px] text-[#6E5F5B] dark:text-zinc-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={bakerNote}
                  onChange={(e) => setBakerNote(e.target.value)}
                  placeholder="e.g. Extra blistered crust, please ring bell upon arrival"
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE7DE] dark:border-[#2D1E1B] text-xs text-[#190F0E] dark:text-white bg-[#FAF7F2] dark:bg-[#1E1413] focus:outline-none focus:border-[#8E1616] resize-none placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#6E5F5B] dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#190F0E] dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[#6E5F5B] dark:text-zinc-400">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.2 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                      FREE over $35
                    </span>
                  ) : (
                    <span className="font-bold text-[#190F0E] dark:text-white">${deliveryFee.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[#6E5F5B] dark:text-zinc-400">
                  <span>Estimated Tax (8.875%)</span>
                  <span className="font-bold text-[#190F0E] dark:text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-[#EFE7DE] dark:border-[#2D1E1B] flex items-center justify-between text-sm">
                  <span className="font-black text-[#190F0E] dark:text-white">Total Due</span>
                  <span className="text-lg font-black text-[#8E1616]">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#8E1616] hover:bg-[#721111] disabled:opacity-50 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-[#8E1616]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Firing Orders to Hearth...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>Fire Order (${grandTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
