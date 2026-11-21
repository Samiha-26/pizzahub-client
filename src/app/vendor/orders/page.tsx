"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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

  const handleDeclineOrder = async (orderId: string, pizzaName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to decline order for "${pizzaName}"? This will cancel the customer's ticket.`
    );
    if (!confirmed) return;

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
      <main className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-9 h-9 animate-spin text-[#8E1616]" />
          <p className="text-sm font-semibold text-[#6E5F5B]">
            Connecting live ticket printer &amp; hearth dispatches...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-[#EBE4D8] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-2xl font-black">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#190F0E]">Vendor Sign In Required</h1>
          <p className="text-xs text-[#6E5F5B] leading-relaxed">
            Please log in with your vendor credentials to access the live kitchen ticket queue and dispatch hearth orders.
          </p>
          <button
            onClick={() => router.push("/signin?redirect=/vendor/orders")}
            className="w-full py-3 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-bold transition shadow-sm"
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
    <main className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E1616] uppercase tracking-wider mb-1">
              <Link href="/vendor/dashboard" className="hover:underline flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5" />
                <span>Kitchen HQ</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#6E5F5B]" />
              <span className="text-[#6E5F5B]">Live Hearth Queue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] tracking-tight">
              Kitchen Order Queue
            </h1>
            <p className="text-xs text-[#6E5F5B] mt-1">
              Accept incoming orders, fire up stone hearths, and advance thermal dispatches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders()}
              className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#EBE4D8] hover:border-[#8E1616]/30 text-xs font-bold text-[#190F0E] flex items-center gap-1.5 transition shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#8E1616]" />
              Refresh
            </button>
            <Link
              href="/vendor/menu"
              className="px-4 py-2.5 rounded-2xl bg-white border border-[#EBE4D8] hover:border-[#8E1616]/40 text-xs font-bold text-[#190F0E] flex items-center gap-1.5 transition shadow-2xs"
            >
              <Store className="w-3.5 h-3.5 text-[#8E1616]" />
              Menu Catalog
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterTab === "all"
                ? "bg-[#8E1616] text-white shadow-sm"
                : "bg-white border border-[#EBE4D8] text-[#6E5F5B] hover:text-[#190F0E]"
            }`}
          >
            <span>All Tickets</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab("active")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterTab === "active"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white border border-[#EBE4D8] text-[#6E5F5B] hover:text-[#190F0E]"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Pending &amp; In Oven</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10">
              {pendingCount + preparingCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab("transit")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterTab === "transit"
                ? "bg-[#190F0E] text-white shadow-sm"
                : "bg-white border border-[#EBE4D8] text-[#6E5F5B] hover:text-[#190F0E]"
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
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterTab === "delivered"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white border border-[#EBE4D8] text-[#6E5F5B] hover:text-[#190F0E]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered Hot</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10">
              {deliveredCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab("cancelled")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterTab === "cancelled"
                ? "bg-red-600 text-white shadow-sm"
                : "bg-white border border-[#EBE4D8] text-[#6E5F5B] hover:text-[#190F0E]"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10">
              {cancelledCount}
            </span>
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EBE4D8] p-12 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-3xl">
              🪵
            </div>
            <h2 className="text-lg font-black text-[#190F0E]">No Orders in This Queue</h2>
            <p className="text-xs text-[#6E5F5B] max-w-sm mx-auto">
              No tickets match your selected tab filter. New customer orders will show up here in real time.
            </p>
            <button
              onClick={() => setFilterTab("all")}
              className="px-5 py-2.5 rounded-2xl bg-white border border-[#EBE4D8] hover:border-[#8E1616] text-xs font-bold text-[#190F0E] transition"
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
                  className="bg-white rounded-3xl border border-[#EBE4D8] shadow-2xs overflow-hidden transition hover:border-[#8E1616]/20"
                >
                  <div className="p-4 sm:p-5 border-b border-[#EBE4D8] flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2]/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center font-black text-sm">
                        #
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#190F0E]">
                            Order {order._id.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              isDelivered
                                ? "bg-emerald-100 text-emerald-800"
                                : isTransit
                                ? "bg-[#190F0E]/10 text-[#190F0E] border border-[#190F0E]/20"
                                : isPreparing
                                ? "bg-amber-100 text-amber-800"
                                : isCancelled
                                ? "bg-red-100 text-red-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6E5F5B] flex items-center gap-2 mt-0.5">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-[#190F0E]">
                            Customer: {order.customerName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#6E5F5B]">Ticket Total</span>
                      <div className="text-lg font-black text-[#8E1616]">
                        ${order.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-[#EBE4D8] bg-[#FAF7F2]">
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
                          <h3 className="text-base font-black text-[#190F0E]">
                            {order.pizzaName}
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8E1616]/10 text-[#8E1616]">
                            {order.crust}
                          </span>
                          <span className="text-[10px] font-bold text-[#6E5F5B]">
                            • {order.category}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#190F0E]">
                          Item Quantity: {order.quantity} × ${order.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE4D8]/80 flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#8E1616] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#190F0E]">Delivery Address</div>
                          <div className="text-[#6E5F5B] leading-relaxed mt-0.5">
                            {order.deliveryAddress}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE4D8]/80 flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 text-[#8E1616] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#190F0E]">Requested Dispatch Window</div>
                          <div className="text-[#6E5F5B] leading-relaxed mt-0.5">
                            {order.deliverySchedule}
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.bakerNote && (
                      <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-2xl text-xs flex items-start gap-2 text-amber-950">
                        <span className="font-bold shrink-0">Baker Note from Customer:</span>
                        <span className="italic">{order.bakerNote}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-[#EBE4D8] space-y-3">
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
                                  ? "bg-stone-50 border-stone-200 opacity-50"
                                  : isDone
                                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                                  : isCur
                                  ? "bg-[#8E1616]/10 border-[#8E1616] text-[#8E1616] ring-1 ring-[#8E1616]/30 font-bold"
                                  : "bg-[#FAF7F2] border-[#EBE4D8] text-[#6E5F5B] opacity-60"
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

                    <div className="pt-4 border-t border-[#EBE4D8] flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-[#6E5F5B]">
                        Current Kitchen Stage:{" "}
                        <strong className="text-[#190F0E] uppercase">
                          {order.status.replace("_", " ")}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              disabled={isBusy}
                              onClick={() => handleDeclineOrder(order._id, order.pizzaName)}
                              className="px-3.5 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition disabled:opacity-50"
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
                              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
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
                            className="px-5 py-2 rounded-xl bg-[#190F0E] hover:bg-[#2C1A18] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
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
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
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
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Delivered &amp; Settled
                          </span>
                        )}

                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-100 text-red-800 text-xs font-black">
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
