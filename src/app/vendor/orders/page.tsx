"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ChefHat,
  Flame,
  Truck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Store,
  ChevronRight,
  ArrowRight,
  User,
  Phone,
} from "lucide-react";
import { getVendorOrders, updateOrderStatus, type OrderRecord } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

const TIMELINE_STEPS = [
  { key: "Order Placed", label: "Order Placed", icon: CheckCircle2 },
  { key: "Hearth Wood-Firing", label: "Wood-Firing", icon: Flame },
  { key: "Thermal Transit", label: "Thermal Transit", icon: Truck },
  { key: "Delivered Hot", label: "Delivered Hot", icon: Sparkles },
];

export default function VendorOrdersPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user;

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "transit" | "delivered" | "cancelled">("all");

  const fetchOrders = useCallback(async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const data = await getVendorOrders(user.email);
      setOrders(data);
    } catch {
      toast.error("Failed to fetch kitchen orders");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchOrders();
    } else if (!isSessionPending) {
      setIsLoading(false);
    }
  }, [user?.email, isSessionPending, fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string, actionLabel: string) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      toast.success(actionLabel, { icon: "🍕" });
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? (res.order || { ...ord, status: newStatus as any }) : ord))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update order status";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const executeDeclineOrder = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, "cancelled");
      toast.success("Order declined and marked cancelled", { icon: "🛑" });
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? (res.order || { ...ord, status: "cancelled" }) : ord))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to decline order";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeclineOrder = (orderId: string, pizzaName: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2 p-1 text-left">
        <p className="text-xs font-bold text-[#190F0E] dark:text-zinc-100">
          Decline ticket for {pizzaName}?
        </p>
        <p className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
          This ticket will be marked as cancelled in your kitchen.
        </p>
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 cursor-pointer"
          >
            Keep Ticket
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              executeDeclineOrder(orderId);
            }}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#8E1616] text-white hover:bg-[#6e1010] cursor-pointer"
          >
            Decline Order
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const getStepStatus = (order: OrderRecord, stepIndex: number): "completed" | "active" | "upcoming" => {
    if (order.status === "cancelled") return "upcoming";
    const statusOrder = ["pending", "preparing", "on_the_way", "delivered"];
    const currentIdx = statusOrder.indexOf(order.status);
    if (stepIndex < currentIdx) return "completed";
    if (stepIndex === currentIdx) return "active";
    return "upcoming";
  };

  if (isSessionPending || (isLoading && user?.email)) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-9 h-9 animate-spin text-[#8E1616]" />
          <p className="text-sm font-semibold text-[#6E5F5B] dark:text-zinc-400">
            Connecting live ticket printer &amp; hearth dispatches...
          </p>
        </div>
      </main>
    );
  }

  if (!user || ((user as any).role !== "vendor" && (user as any).role !== "admin")) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-20 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-[#1A1110] rounded-3xl p-8 border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-2xl font-black">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#190F0E] dark:text-white">Vendor Sign In Required</h1>
          <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 leading-relaxed">
            Please log in with your vendor credentials to access the live kitchen ticket queue and dispatch hearth orders.
          </p>
          <button
            onClick={() => router.push("/signin?redirect=/vendor/orders")}
            className="w-full py-3 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Sign In to Kitchen Portal
          </button>
        </div>
      </main>
    );
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const transitCount = orders.filter((o) => o.status === "on_the_way").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  const filteredOrders = orders.filter((ord) => {
    if (filterTab === "active") return ord.status === "pending" || ord.status === "preparing";
    if (filterTab === "transit") return ord.status === "on_the_way";
    if (filterTab === "delivered") return ord.status === "delivered";
    if (filterTab === "cancelled") return ord.status === "cancelled";
    return true;
  });

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] dark:border-[#2D1E1B] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E1616] uppercase tracking-wider mb-1">
              <Link href="/vendor/dashboard" className="hover:underline flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5" />
                <span>Kitchen HQ</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#6E5F5B] dark:text-zinc-400" />
              <span className="text-[#6E5F5B] dark:text-zinc-400">Live Hearth Queue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] dark:text-white tracking-tight">
              Kitchen Order Queue
            </h1>
            <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 mt-1">
              Accept incoming orders, fire up stone hearths, and advance thermal dispatches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders()}
              className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] hover:border-[#8E1616]/30 text-xs font-bold text-[#190F0E] dark:text-zinc-200 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#8E1616]" />
              Refresh
            </button>
            <Link
              href="/vendor/menu"
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] hover:border-[#8E1616]/40 text-xs font-bold text-[#190F0E] dark:text-zinc-200 flex items-center gap-1.5 transition shadow-2xs"
            >
              <Store className="w-3.5 h-3.5 text-[#8E1616]" />
              Menu Catalog
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              filterTab === "all"
                ? "bg-[#8E1616] text-white shadow-sm"
                : "bg-white dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] text-[#6E5F5B] dark:text-zinc-400 hover:text-[#190F0E] dark:hover:text-white"
            }`}
          >
            <span>All Tickets</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab("active")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              filterTab === "active"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] text-[#6E5F5B] dark:text-zinc-400 hover:text-[#190F0E] dark:hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Pending &amp; In Oven</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
              {pendingCount + preparingCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab("transit")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              filterTab === "transit"
                ? "bg-[#190F0E] dark:bg-zinc-800 text-white shadow-sm"
                : "bg-white dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] text-[#6E5F5B] dark:text-zinc-400 hover:text-[#190F0E] dark:hover:text-white"
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-amber-500" />
            <span>Thermal Transit</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {transitCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab("delivered")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              filterTab === "delivered"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] text-[#6E5F5B] dark:text-zinc-400 hover:text-[#190F0E] dark:hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered Hot</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
              {deliveredCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab("cancelled")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              filterTab === "cancelled"
                ? "bg-red-600 text-white shadow-sm"
                : "bg-white dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] text-[#6E5F5B] dark:text-zinc-400 hover:text-[#190F0E] dark:hover:text-white"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
              {cancelledCount}
            </span>
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1110] rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] p-12 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-3xl">
              🪵
            </div>
            <h2 className="text-lg font-black text-[#190F0E] dark:text-white">No Orders in This Queue</h2>
            <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 max-w-sm mx-auto">
              No tickets match your selected tab filter. New customer orders will show up here in real time.
            </p>
            <button
              onClick={() => setFilterTab("all")}
              className="px-5 py-2.5 rounded-2xl bg-white dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] hover:border-[#8E1616] text-xs font-bold text-[#190F0E] dark:text-zinc-200 transition cursor-pointer"
            >
              View All Orders
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const isPending = order.status === "pending";
              const isPreparing = order.status === "preparing";
              const isTransit = order.status === "on_the_way";
              const isDelivered = order.status === "delivered";
              const isCancelled = order.status === "cancelled";
              const isBusy = updatingId === order._id;

              return (
                <div
                  key={order._id}
                  className="bg-white dark:bg-[#1A1110] rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs overflow-hidden transition hover:border-[#8E1616]/20"
                >
                  <div className="p-4 sm:p-5 border-b border-[#EBE4D8] dark:border-[#2D1E1B] flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2]/60 dark:bg-[#160D0C]/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center font-black text-sm">
                        #
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#190F0E] dark:text-white">
                            Order {order._id.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              isDelivered
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : isTransit
                                ? "bg-[#190F0E]/10 text-[#190F0E] dark:bg-zinc-800 dark:text-zinc-200 border border-[#190F0E]/20 dark:border-zinc-700"
                                : isPreparing
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : isCancelled
                                ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                            }`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-[#190F0E] dark:text-zinc-200">
                            Customer: {order.customerName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#6E5F5B] dark:text-zinc-400">Ticket Total</span>
                      <div className="text-lg font-black text-[#8E1616]">
                        ${order.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-[#EBE4D8] dark:border-[#2D1E1B] bg-[#FAF7F2] dark:bg-[#1E1413]">
                        <img
                          src={
                            order.pizzaImage ||
                            "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
                          }
                          alt={order.pizzaName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-[#190F0E] dark:text-white">
                            {order.pizzaName}
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8E1616]/10 text-[#8E1616]">
                            {order.crust}
                          </span>
                          <span className="text-[10px] font-bold text-[#6E5F5B] dark:text-zinc-400">
                            • {order.category}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#190F0E] dark:text-zinc-200">
                          Item Quantity: {order.quantity} × ${order.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#FAF7F2] dark:bg-[#1E1413] p-3.5 rounded-2xl border border-[#EBE4D8]/80 dark:border-[#2D1E1B] flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#8E1616] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#190F0E] dark:text-white">Delivery Address</div>
                          <div className="text-[#6E5F5B] dark:text-zinc-200 font-medium leading-relaxed mt-0.5">
                            {order.deliveryAddress}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#FAF7F2] dark:bg-[#1E1413] p-3.5 rounded-2xl border border-[#EBE4D8]/80 dark:border-[#2D1E1B] flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 text-[#8E1616] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#190F0E] dark:text-white">Requested Dispatch Window</div>
                          <div className="text-[#6E5F5B] dark:text-zinc-200 font-medium leading-relaxed mt-0.5">
                            {order.deliverySchedule}
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.bakerNote && (
                      <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-400/50 dark:border-amber-500/40 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 shadow-2xs">
                        <span className="font-black shrink-0 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-[10px] uppercase tracking-wider">
                          Customer Baker Note
                        </span>
                        <span className="leading-relaxed font-semibold text-[#190F0E] dark:text-amber-100 mt-0.5">
                          {order.bakerNote}
                        </span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-[#EBE4D8] dark:border-[#2D1E1B] space-y-3">
                      <div className="text-[11px] font-bold text-[#8E1616] uppercase tracking-wider">
                        Kitchen Dispatch Progress
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {TIMELINE_STEPS.map((step, idx) => {
                          const Icon = step.icon;
                          const stepStatus = getStepStatus(order, idx);
                          const isDone = stepStatus === "completed";
                          const isCur = stepStatus === "active";

                          return (
                            <div
                              key={step.key}
                              className={`p-2.5 rounded-2xl border text-center relative ${
                                isCancelled
                                  ? "bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-50"
                                  : isDone
                                  ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-300"
                                  : isCur
                                  ? "bg-[#8E1616]/10 dark:bg-[#8E1616]/30 border-[#8E1616] text-[#8E1616] dark:text-red-400 ring-1 ring-[#8E1616]/30 font-bold"
                                  : "bg-[#FAF7F2] dark:bg-[#1E1413] border-[#EBE4D8] dark:border-[#2D1E1B] text-[#6E5F5B] dark:text-zinc-400 opacity-60"
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span className="text-[10px] font-extrabold truncate">
                                  {step.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#EBE4D8] dark:border-[#2D1E1B] flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-[#6E5F5B] dark:text-zinc-400">
                        Current Kitchen Stage:{" "}
                        <strong className="text-[#190F0E] dark:text-white uppercase">
                          {order.status.replace("_", " ")}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              disabled={isBusy}
                              onClick={() => handleDeclineOrder(order._id, order.pizzaName)}
                              className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                            >
                              Decline Ticket
                            </button>
                            <button
                              disabled={isBusy}
                              onClick={() =>
                                handleStatusChange(
                                  order._id,
                                  "preparing",
                                  `Ticket #${order._id.slice(-6)} fired into stone hearth!`
                                )
                              }
                              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
                            >
                              {isBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Flame className="w-3.5 h-3.5" />
                              )}
                              <span>Accept &amp; Fire Hearth</span>
                            </button>
                          </>
                        )}

                        {isPreparing && (
                          <button
                            disabled={isBusy}
                            onClick={() =>
                              handleStatusChange(
                                order._id,
                                "on_the_way",
                                `Ticket #${order._id.slice(-6)} dispatched in thermal box!`
                              )
                            }
                            className="px-5 py-2 rounded-xl bg-[#190F0E] hover:bg-[#2C1A18] dark:bg-[#8E1616] dark:hover:bg-[#721111] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Truck className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span>Hand Off to Thermal Transit</span>
                          </button>
                        )}

                        {isTransit && (
                          <button
                            disabled={isBusy}
                            onClick={() =>
                              handleStatusChange(
                                order._id,
                                "delivered",
                                `Ticket #${order._id.slice(-6)} confirmed delivered hot!`
                              )
                            }
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            <span>Mark as Delivered Hot</span>
                          </button>
                        )}

                        {isDelivered && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Delivered &amp; Settled
                          </span>
                        )}

                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs font-black">
                            <XCircle className="w-3.5 h-3.5" />
                            Cancelled Ticket
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
