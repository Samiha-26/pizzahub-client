"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ChevronRight,
  Flame,
  Clock,
  ShoppingBag,
  Store,
  MapPin,
  CheckCircle2,
  Calendar,
  Loader2,
  X,
  Plus,
  Minus,
  Zap,
  Tag,
} from "lucide-react";
import { getPizzaById, createOrder, resolveApiBaseUrl, type PizzaDetail } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useCart } from "@/context/CartContext";
import PizzaReviews from "@/components/menu/PizzaReviews";

const TIME_SLOTS = [
  "12:30 PM - 01:00 PM",
  "01:30 PM - 02:00 PM",
  "06:30 PM - 07:00 PM",
  "07:30 PM - 08:00 PM",
  "08:30 PM - 09:00 PM",
  "09:30 PM - 10:00 PM",
];

export default function PizzaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = useSession();
  const user = session?.user;
  const isVendorOrAdmin = (user as any)?.role === "vendor" || (user as any)?.role === "admin";
  const { addItem, setIsCartOpen } = useCart();

  useEffect(() => {
    if (!isAuthPending && !user) {
      router.push(`/signin?redirect=/menu/${unwrappedParams.id}`);
    }
  }, [isAuthPending, user, unwrappedParams.id, router]);

  const [pizza, setPizza] = useState<PizzaDetail | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [scheduleType, setScheduleType] = useState<"asap" | "later">("asap");
  const [selectedDay, setSelectedDay] = useState<"today" | "tomorrow">("today");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[2]);
  const [bakerNote, setBakerNote] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPizza() {
      setIsLoading(true);
      const data = await getPizzaById(unwrappedParams.id);
      if (isMounted) {
        setPizza(data);
        setIsLoading(false);
      }
    }

    loadPizza();
    return () => {
      isMounted = false;
    };
  }, [unwrappedParams.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedArea = localStorage.getItem("pizzahub_delivery_area");
      if (savedArea) {
        setDeliveryAddress(savedArea);
      }
    }
  }, []);

  const handleOpenOrderModal = () => {
    if (!user) {
      toast.error("Please sign in to place your artisan order", { icon: "🔒" });
      router.push(`/signin?redirect=/menu/${unwrappedParams.id}`);
      return;
    }

    if ((user as any).role === "admin") {
      toast.error("Administrators cannot place customer orders", { icon: "🛡️" });
      return;
    }

    if (pizza && (user as any).role === "vendor") {
      if (
        (pizza.vendorEmail && user.email?.toLowerCase() === pizza.vendorEmail.toLowerCase()) ||
        (pizza.vendorId && (user as any).id === pizza.vendorId)
      ) {
        toast.error("Vendors cannot order their own menu items", { icon: "👨‍🍳" });
        return;
      }
    }

    if (!deliveryAddress && typeof window !== "undefined") {
      const savedArea = localStorage.getItem("pizzahub_delivery_area");
      if (savedArea) {
        setDeliveryAddress(savedArea);
      }
    }

    setIsOrderModalOpen(true);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!pizza) return;
    setIsValidatingCoupon(true);
    const subtotal = pizza.price * quantity;
    const apiBase = resolveApiBaseUrl();
    try {
      const res = await fetch(`${apiBase}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderTotal: subtotal,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        toast.error(data.error || "Invalid coupon code");
        return;
      }
      setAppliedCoupon(data.code);
      setDiscountAmount(data.discountAmount);
      toast.success(`Coupon ${data.code} applied! Saved $${data.discountAmount.toFixed(2)}`, {
        icon: "🎟️",
      });
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryAddress.trim()) {
      toast.error("Please provide a delivery address");
      return;
    }

    if (!user?.email) {
      toast.error("Please sign in to confirm your order", { icon: "🔒" });
      router.push(`/signin?redirect=/menu/${unwrappedParams.id}`);
      return;
    }

    if (!pizza) return;

    const scheduledTime =
      scheduleType === "asap"
        ? "ASAP (25–35 min hearth dispatch)"
        : `${selectedDay === "today" ? "Today" : "Tomorrow"} • ${selectedTimeSlot}`;

    setIsSubmittingOrder(true);

    try {
      await createOrder({
        customerEmail: user.email,
        customerName: user.name || "Pizza Enthusiast",
        pizzaId: pizza.id,
        pizzaName: pizza.name,
        pizzaImage: pizza.image,
        price: pizza.price,
        quantity,
        totalPrice: Number(Math.max(0, pizza.price * quantity - discountAmount).toFixed(2)),
        crust: pizza.crust,
        category: pizza.category,
        vendorId: pizza.vendorId || "vendor_artisan_01",
        vendorName: pizza.vendorName || "Forno Antico Pizzeria",
        deliveryAddress: deliveryAddress.trim(),
        deliverySchedule: scheduledTime,
        bakerNote: bakerNote.trim() || undefined,
      });

      toast.success(
        `Order fired! ${quantity}x ${pizza.name} scheduled for ${scheduledTime}.`,
        { icon: "🍕", duration: 5000 }
      );
      setIsOrderModalOpen(false);
      router.push("/orders");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      toast.error(msg);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col justify-center items-center gap-3 text-[#8E1616]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs font-bold text-[#6E5F5B]">
          Preheating stone hearth &amp; fetching recipe...
        </span>
      </div>
    );
  }

  if (!pizza) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-4xl">🍕</div>
        <h2 className="text-xl font-black text-[#190F0E]">Pizza Recipe Not Found</h2>
        <p className="text-xs text-[#6E5F5B]">
          The artisan creation you are looking for may have been retired or moved.
        </p>
        <Link
          href="/menu"
          className="inline-block px-5 py-2.5 rounded-2xl bg-[#8E1616] text-white text-xs font-bold shadow-sm"
        >
          Return to Menu Catalog
        </Link>
      </div>
    );
  }

  const galleryImages =
    pizza.images && pizza.images.length > 0 ? pizza.images : [pizza.image];
  const subtotal = pizza.price * quantity;
  const finalPrice = Math.max(0, subtotal - discountAmount);
  const totalPrice = finalPrice.toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div className="flex items-center gap-1.5 text-xs text-[#6E5F5B] dark:text-zinc-400">
        <Link href="/" className="hover:text-[#8E1616] dark:hover:text-[#E25C5C] transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/menu" className="hover:text-[#8E1616] dark:hover:text-[#E25C5C] transition">
          Browse Menu
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#190F0E] dark:text-white font-bold truncate max-w-[200px]">
          {pizza.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-[#EFE7DE] dark:border-[#2D1E1B] bg-white dark:bg-[#1A1110] aspect-[4/3] shadow-xs">
            <img
              src={galleryImages[activeImageIndex] || pizza.image}
              alt={pizza.name}
              className="w-full h-full object-cover transition-all duration-300"
            />

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {pizza.badges?.map((badge) => (
                <span
                  key={badge}
                  className="bg-[#190F0E]/85 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5"
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{badge}</span>
                </span>
              ))}
            </div>

            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{pizza.prepTimeMinutes} Min Fast Bake</span>
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    activeImageIndex === idx
                      ? "border-[#8E1616] dark:border-[#E25C5C] ring-2 ring-[#8E1616]/30"
                      : "border-[#EFE7DE] dark:border-[#2D1E1B] hover:border-gray-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${pizza.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8E1616] dark:text-[#E25C5C] bg-[#8E1616]/10 dark:bg-[#8E1616]/20 px-3 py-1 rounded-full">
                {pizza.category}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#8E1616] dark:text-[#E25C5C]">
                ${pizza.price.toFixed(2)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] dark:text-white tracking-tight">
              {pizza.name}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#8E1616] dark:text-[#E25C5C] italic">
              {pizza.tagline}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#6E5F5B] dark:text-zinc-300 leading-relaxed font-medium">
            {pizza.description}
          </p>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1110] border border-[#EFE7DE] dark:border-[#2D1E1B] shadow-2xs space-y-3">
            <div className="text-xs font-bold text-[#190F0E] dark:text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#8E1616] dark:text-[#E25C5C]" />
              <span>Crust Fermentation Style</span>
            </div>
            <div className="inline-block text-xs font-bold text-[#190F0E] dark:text-zinc-200 bg-[#FAF7F2] dark:bg-[#251715] border border-[#EFE7DE] dark:border-[#3D2824] px-3 py-1.5 rounded-xl">
              {pizza.crust}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#190F0E] dark:text-white">
              Fresh Hand-Selected Ingredients
            </h3>
            <div className="flex flex-wrap gap-2">
              {pizza.ingredients?.map((ing) => (
                <span
                  key={ing}
                  className="text-xs font-medium text-[#190F0E] dark:text-zinc-200 bg-white dark:bg-[#1A1110] border border-[#EFE7DE] dark:border-[#2D1E1B] px-3 py-1 rounded-full shadow-2xs"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1A1110] border border-[#EFE7DE] dark:border-[#2D1E1B] text-center shadow-2xs">
              <div className="text-xs text-[#6E5F5B] dark:text-zinc-400">Bake Temp</div>
              <div className="text-sm font-black text-[#190F0E] dark:text-white mt-0.5">450°C Stone</div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1A1110] border border-[#EFE7DE] dark:border-[#2D1E1B] text-center shadow-2xs">
              <div className="text-xs text-[#6E5F5B] dark:text-zinc-400">Calories</div>
              <div className="text-sm font-black text-[#190F0E] dark:text-white mt-0.5">{pizza.calories} kcal</div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1A1110] border border-[#EFE7DE] dark:border-[#2D1E1B] text-center shadow-2xs">
              <div className="text-xs text-[#6E5F5B] dark:text-zinc-400">Taste Score</div>
              <div className="text-sm font-black text-[#190F0E] dark:text-white mt-0.5">★ {pizza.rating}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1A1110] border border-[#EFE7DE] dark:border-[#2D1E1B] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-[#8E1616] dark:text-[#E25C5C]" />
              <div>
                <div className="font-bold text-[#190F0E] dark:text-white">{pizza.vendorName}</div>
                <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">{pizza.vendorAddress}</div>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={isVendorOrAdmin}
              onClick={() => {
                if (isVendorOrAdmin) {
                  toast.error("Ordering is reserved for customer accounts", { icon: "🛡️" });
                  return;
                }
                addItem({
                  id: pizza.id,
                  name: pizza.name,
                  price: pizza.price,
                  image: pizza.images?.[0] || "",
                  category: pizza.category,
                  vendorName: pizza.vendorName,
                  crust: pizza.crust,
                });
                setIsCartOpen(true);
              }}
              className={`flex-1 py-4 rounded-2xl border-2 text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 shadow-xs ${
                isVendorOrAdmin
                  ? "bg-stone-100 dark:bg-stone-900 border-stone-300 dark:border-stone-800 text-stone-400 cursor-not-allowed"
                  : "bg-white dark:bg-[#1A1110] border-[#8E1616] dark:border-[#E25C5C] text-[#8E1616] dark:text-[#E25C5C] hover:bg-[#FAF7F2] dark:hover:bg-[#251715] cursor-pointer"
              }`}
              title={isVendorOrAdmin ? "Ordering is disabled for vendor and admin accounts" : "Add to Cart"}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <button
              type="button"
              disabled={isVendorOrAdmin}
              onClick={handleOpenOrderModal}
              className={`flex-1 py-4 rounded-2xl text-sm font-extrabold transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
                isVendorOrAdmin
                  ? "bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed shadow-none"
                  : "bg-[#8E1616] hover:bg-[#731212] text-white shadow-[#8E1616]/25 hover:-translate-y-0.5 cursor-pointer"
              }`}
              title={isVendorOrAdmin ? "Ordering is disabled for vendor and admin accounts" : "Order Now"}
            >
              <Zap className="w-4 h-4" />
              <span>Order Now (${pizza.price.toFixed(2)})</span>
            </button>
          </div>

          {isVendorOrAdmin && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 flex items-center gap-2.5 text-xs text-amber-950 dark:text-amber-200 font-bold">
              <Store className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>
                {(user as any)?.role === "vendor"
                  ? "Ordering is reserved for customer accounts. Manage your recipes in the Kitchen Portal."
                  : "Ordering is reserved for customer accounts. Moderate recipes in the Admin Console."}
              </span>
            </div>
          )}
        </div>
      </div>

      <PizzaReviews
        pizzaId={unwrappedParams.id}
        vendorName={pizza?.vendorName}
        vendorEmail={pizza?.vendorEmail}
      />

      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#1A1110] rounded-3xl border border-[#EFE7DE] dark:border-[#2D1E1B] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DE] dark:border-[#2D1E1B]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#8E1616] text-white flex items-center justify-center text-sm shadow-xs">
                  🍕
                </div>
                <div>
                  <h3 className="text-base font-black text-[#190F0E] dark:text-white">
                    Dispatch Your Wood-Fired Pie
                  </h3>
                  <p className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
                    Direct order dispatch to {pizza.vendorName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#251715] hover:bg-gray-200 dark:hover:bg-[#32201D] flex items-center justify-center text-gray-600 dark:text-zinc-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1413] border border-[#EFE7DE] dark:border-[#2D1E1B] flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-[#190F0E] dark:text-white">{pizza.name}</div>
                  <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
                    ${pizza.price.toFixed(2)} each • {pizza.crust}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white dark:bg-[#241816] border border-[#EFE7DE] dark:border-[#2D1E1B] px-2 py-1 rounded-xl shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-[#32201D] hover:bg-gray-200 dark:hover:bg-[#3E2825] flex items-center justify-center text-xs text-[#190F0E] dark:text-zinc-200 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-[#190F0E] dark:text-white min-w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-[#32201D] hover:bg-gray-200 dark:hover:bg-[#3E2825] flex items-center justify-center text-xs text-[#190F0E] dark:text-zinc-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#190F0E] dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#8E1616] dark:text-[#E25C5C]" />
                    <span>Delivery Address *</span>
                  </label>
                  {deliveryAddress && (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                      Auto-filled from location
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street address, house/flat number, road, city"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE7DE] dark:border-[#2D1E1B] text-xs text-[#190F0E] dark:text-white focus:outline-none focus:border-[#8E1616] transition bg-white dark:bg-[#1E1413] placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#190F0E] dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8E1616] dark:text-[#E25C5C]" />
                  <span>Delivery Schedule *</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleType("asap")}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      scheduleType === "asap"
                        ? "border-[#8E1616] bg-[#8E1616]/5 dark:bg-[#8E1616]/20 ring-1 ring-[#8E1616]"
                        : "border-[#EFE7DE] dark:border-[#2D1E1B] bg-white dark:bg-[#1E1413] hover:border-gray-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <Zap className={`w-4 h-4 ${scheduleType === "asap" ? "text-[#8E1616] dark:text-[#E25C5C]" : "text-gray-400"}`} />
                    <div>
                      <div className="text-xs font-bold text-[#190F0E] dark:text-white">ASAP Dispatch</div>
                      <div className="text-[10px] text-[#6E5F5B] dark:text-zinc-400">Within 25–35 mins</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleType("later")}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      scheduleType === "later"
                        ? "border-[#8E1616] bg-[#8E1616]/5 dark:bg-[#8E1616]/20 ring-1 ring-[#8E1616]"
                        : "border-[#EFE7DE] dark:border-[#2D1E1B] bg-white dark:bg-[#1E1413] hover:border-gray-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <Clock className={`w-4 h-4 ${scheduleType === "later" ? "text-[#8E1616] dark:text-[#E25C5C]" : "text-gray-400"}`} />
                    <div>
                      <div className="text-xs font-bold text-[#190F0E] dark:text-white">Schedule Later</div>
                      <div className="text-[10px] text-[#6E5F5B] dark:text-zinc-400">Choose day &amp; time</div>
                    </div>
                  </button>
                </div>

                {scheduleType === "later" && (
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#160D0C] border border-[#EFE7DE] dark:border-[#2D1E1B] space-y-3 animate-in fade-in">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDay("today")}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedDay === "today"
                            ? "bg-[#8E1616] text-white shadow-xs"
                            : "bg-white dark:bg-[#1E1413] text-[#6E5F5B] dark:text-zinc-300 border border-[#EFE7DE] dark:border-[#2D1E1B]"
                        }`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDay("tomorrow")}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedDay === "tomorrow"
                            ? "bg-[#8E1616] text-white shadow-xs"
                            : "bg-white dark:bg-[#1E1413] text-[#6E5F5B] dark:text-zinc-300 border border-[#EFE7DE] dark:border-[#2D1E1B]"
                        }`}
                      >
                        Tomorrow
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-[#6E5F5B] dark:text-zinc-400 tracking-wider">
                        Select Delivery Window:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-2 rounded-xl text-[11px] font-bold text-center border transition cursor-pointer ${
                              selectedTimeSlot === slot
                                ? "bg-white dark:bg-[#251715] border-[#8E1616] dark:border-[#E25C5C] text-[#8E1616] dark:text-[#E25C5C] shadow-2xs"
                                : "bg-white/60 dark:bg-[#1E1413] border-[#EFE7DE] dark:border-[#2D1E1B] text-[#6E5F5B] dark:text-zinc-300 hover:bg-white dark:hover:bg-[#251715]"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#190F0E] dark:text-white block">
                  Baker's Note / Delivery Instructions <span className="text-[10px] text-[#6E5F5B] dark:text-zinc-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={bakerNote}
                  onChange={(e) => setBakerNote(e.target.value)}
                  placeholder="e.g. Extra blistered crust, please call on arrival, don't ring bell"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EFE7DE] dark:border-[#2D1E1B] text-xs text-[#190F0E] dark:text-white focus:outline-none focus:border-[#8E1616] transition bg-white dark:bg-[#1E1413] placeholder:text-gray-400 dark:placeholder:text-zinc-500 resize-none"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-[#190F0E] dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#8E1616] dark:text-[#E25C5C]" />
                    <span>Promotional Voucher</span>
                  </span>
                  {appliedCoupon && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                      Saved ${discountAmount.toFixed(2)} with {appliedCoupon}
                    </span>
                  )}
                </label>

                {!appliedCoupon ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. WOODFIRED10, ARTISAN5"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-[#EFE7DE] dark:border-[#2D1E1B] text-xs text-[#190F0E] dark:text-white uppercase focus:outline-none focus:border-[#8E1616] transition bg-white dark:bg-[#1E1413] placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-4 py-2 rounded-xl bg-[#190F0E] dark:bg-zinc-800 hover:bg-black dark:hover:bg-zinc-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                    >
                      {isValidatingCoupon ? "Checking..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      Voucher Applied: {appliedCoupon}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#EFE7DE] dark:border-[#2D1E1B] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">Total Due</div>
                  <div className="text-lg font-black text-[#8E1616] dark:text-[#E25C5C]">${totalPrice}</div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="px-6 py-3 rounded-2xl bg-[#8E1616] hover:bg-[#731212] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#8E1616]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Firing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm &amp; Fire Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
