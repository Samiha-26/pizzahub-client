"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ShoppingBag,
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
  ChevronRight,
  ArrowRight,
  Store,
  FileText,
} from "lucide-react";
import { getMyOrders, cancelOrder, type OrderRecord } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import OrderInvoiceModal from "@/components/orders/OrderInvoiceModal";

const TIMELINE_STEPS = [
  { key: "Order Placed", label: "Order Placed", desc: "Received & logged", icon: CheckCircle2 },
  { key: "Hearth Wood-Firing", label: "Wood-Firing", desc: "Baking at 900°F", icon: Flame },
  { key: "Thermal Transit", label: "Thermal Transit", desc: "Out in insulated box", icon: Truck },
  { key: "Delivered Hot", label: "Delivered Hot", desc: "Enjoy your pizza!", icon: Sparkles },
];

export default function MyOrdersPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user;

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderRecord | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const data = await getMyOrders(user.email);
      setOrders(data);
    } catch {
      toast.error("Failed to fetch order history");
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

  const handleCancelOrder = async (orderId: string, pizzaName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel your order for "${pizzaName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      toast.success("Order cancelled successfully", { icon: "🛑" });
      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === orderId
            ? { ...ord, status: "cancelled", cancelledAt: new Date().toISOString() }
            : ord
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel order";
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const getStepStatus = (
    order: OrderRecord,
    stepIndex: number
  ): "completed" | "active" | "upcoming" => {
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
            Fetching your live stone-hearth dispatch tracking...
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
            🍕
          </div>
          <h1 className="text-xl font-black text-[#190F0E]">Sign In to Track Orders</h1>
          <p className="text-xs text-[#6E5F5B] leading-relaxed">
            Please log in with your PizzaHub account to track real-time wood-fired baking and delivery dispatches.
          </p>
          <button
            onClick={() => router.push("/signin?redirect=/orders")}
            className="w-full py-3 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-bold transition shadow-sm"
          >
            Sign In with Account
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E1616] uppercase tracking-wider mb-1">
              <span>Customer Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#6E5F5B]" />
              <span className="text-[#6E5F5B]">Live Hearth Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] tracking-tight">
              My Pizza Orders
            </h1>
            <p className="text-xs text-[#6E5F5B] mt-1">
              Real-time monitoring from wood-fired oven dispatch to your doorstep.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders()}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#EBE4D8] hover:border-[#8E1616]/30 text-xs font-bold text-[#190F0E] flex items-center gap-1.5 transition shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#8E1616]" />
              Refresh
            </button>
            <Link
              href="/menu"
              className="px-4 py-2 rounded-xl bg-[#8E1616] hover:bg-[#721111] text-xs font-bold text-white flex items-center gap-1.5 transition shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Order More
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EBE4D8] p-12 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-3xl">
              🍕
            </div>
            <h2 className="text-lg font-black text-[#190F0E]">No Active Orders Yet</h2>
            <p className="text-xs text-[#6E5F5B] max-w-sm mx-auto">
              Your pizza queue is empty. Explore our 48h cold-fermented artisan creations and fire your first order!
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-bold shadow-sm transition"
            >
              Explore Artisan Menu
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isPending = order.status === "pending";
              const isCancelled = order.status === "cancelled";

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-[#EBE4D8] shadow-2xs overflow-hidden transition hover:border-[#8E1616]/20"
                >
                  <div className="p-4 sm:p-6 border-b border-[#EBE4D8] flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2]/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center font-black text-sm">
                        #
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#190F0E]">
                            Order {order._id.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              order.status === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.status === "on_the_way"
                                ? "bg-[#190F0E]/10 text-[#190F0E] border border-[#190F0E]/20"
                                : order.status === "preparing"
                                ? "bg-amber-100 text-amber-800"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6E5F5B]">
                          Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="px-3 py-1.5 rounded-xl border border-[#EBE4D8] bg-white hover:bg-[#FAF7F2] text-[#190F0E] text-[11px] font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#8E1616]" />
                        <span>Receipt</span>
                      </button>

                      {isPending && (
                        <button
                          disabled={cancellingId === order._id}
                          onClick={() => handleCancelOrder(order._id, order.pizzaName)}
                          className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition flex items-center gap-1 disabled:opacity-50"
                        >
                          {cancellingId === order._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          Cancel Order
                        </button>
                      )}
                      <div className="text-right">
                        <span className="text-xs text-[#6E5F5B]">Total Amount</span>
                        <div className="text-base font-black text-[#8E1616]">
                          ${order.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-[#EBE4D8] bg-[#FAF7F2]">
                        <Image
                          src={
                            order.pizzaImage ||
                            "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
                          }
                          alt={order.pizzaName}
                          fill
                          className="object-cover"
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
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6E5F5B]">
                          <Store className="w-3.5 h-3.5 text-[#8E1616]" />
                          <span>{order.vendorName}</span>
                          <span>•</span>
                          <span>{order.category}</span>
                        </div>
                        <div className="text-xs font-semibold text-[#190F0E] pt-1">
                          Quantity: {order.quantity} × ${order.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE4D8]/80 flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#8E1616] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#190F0E]">Delivery Destination</div>
                          <div className="text-[#6E5F5B] leading-relaxed mt-0.5">
                            {order.deliveryAddress}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE4D8]/80 flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 text-[#8E1616] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#190F0E]">Dispatch Window</div>
                          <div className="text-[#6E5F5B] leading-relaxed mt-0.5">
                            {order.deliverySchedule}
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.bakerNote && (
                      <div className="bg-amber-50/60 border border-amber-200/70 p-3 rounded-2xl text-xs flex items-start gap-2 text-amber-900">
                        <span className="font-bold shrink-0">Baker Note:</span>
                        <span className="italic">{order.bakerNote}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-[#EBE4D8]">
                      <div className="text-[11px] font-bold text-[#8E1616] uppercase tracking-wider mb-4 flex items-center justify-between">
                        <span>Dispatch Timeline</span>
                        {isCancelled && (
                          <span className="text-red-600 font-bold flex items-center gap-1 lowercase">
                            <AlertCircle className="w-3.5 h-3.5" /> order was cancelled
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {TIMELINE_STEPS.map((step, idx) => {
                          const Icon = step.icon;
                          const stepStatus = getStepStatus(order, idx);

                          const isStepCompleted = stepStatus === "completed";
                          const isStepActive = stepStatus === "active";

                          return (
                            <div
                              key={step.key}
                              className={`p-3 rounded-2xl border transition relative ${
                                isCancelled
                                  ? "bg-stone-50 border-stone-200 opacity-50"
                                  : isStepCompleted
                                  ? "bg-emerald-50/60 border-emerald-200"
                                  : isStepActive
                                  ? "bg-[#8E1616]/5 border-[#8E1616] ring-1 ring-[#8E1616]/20"
                                  : "bg-[#FAF7F2] border-[#EBE4D8] opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                    isCancelled
                                      ? "bg-stone-200 text-stone-500"
                                      : isStepCompleted
                                      ? "bg-emerald-500 text-white"
                                      : isStepActive
                                      ? "bg-[#8E1616] text-white"
                                      : "bg-stone-200 text-stone-500"
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[11px] font-bold text-[#190F0E] truncate">
                                  {step.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#6E5F5B] leading-tight">
                                {step.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <OrderInvoiceModal
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </main>
  );
}
