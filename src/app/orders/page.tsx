"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
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
  FileText,
  XCircle,
  Flame,
  Truck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { getMyOrders, cancelOrder, type OrderRecord } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import OrderInvoiceModal from "@/components/orders/OrderInvoiceModal";

const TIMELINE_STEPS = [
  {
    key: "Order Placed",
    label: "Order Placed",
    desc: "Received by stone hearth",
    icon: CheckCircle2,
  },
  {
    key: "Hearth Wood-Firing",
    label: "Hearth Wood-Firing",
    desc: "450°C refractory stone",
    icon: Flame,
  },
  {
    key: "Thermal Transit",
    label: "Thermal Transit",
    desc: "Micro-vented heated box",
    icon: Truck,
  },
  {
    key: "Delivered Hot",
    label: "Delivered Hot",
    desc: "Doorstep hand-off",
    icon: Sparkles,
  },
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
      toast.error("Failed to load your orders");
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

  const executeCancelOrder = async (orderId: string) => {
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

  const handleCancelOrder = (orderId: string, pizzaName: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2 p-1 text-left">
        <p className="text-xs font-bold text-[#190F0E] dark:text-zinc-100">
          Cancel order for {pizzaName}?
        </p>
        <p className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
          This dispatch will be cancelled immediately.
        </p>
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 cursor-pointer"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              executeCancelOrder(orderId);
            }}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#8E1616] text-white hover:bg-[#6e1010] cursor-pointer"
          >
            Cancel Order
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
            Fetching your live stone-hearth dispatch tracking...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-20 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-[#1A1110] rounded-3xl p-8 border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-2xl font-black">
            🍕
          </div>
          <h1 className="text-xl font-black text-[#190F0E] dark:text-white">Sign In to Track Orders</h1>
          <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 leading-relaxed">
            Please log in with your PizzaHub account to track real-time wood-fired baking and delivery dispatches.
          </p>
          <button
            onClick={() => router.push("/signin?redirect=/orders")}
            className="w-full py-3 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Sign In with Account
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] dark:border-[#2D1E1B] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E1616] uppercase tracking-wider mb-1">
              <span>Customer Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#6E5F5B] dark:text-zinc-400" />
              <span className="text-[#6E5F5B] dark:text-zinc-400">Live Hearth Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] dark:text-white tracking-tight">
              My Pizza Orders
            </h1>
            <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 mt-1">
              Real-time monitoring from wood-fired oven dispatch to your doorstep.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders()}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] hover:border-[#8E1616]/30 text-xs font-bold text-[#190F0E] dark:text-zinc-200 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
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
          <div className="bg-white dark:bg-[#1A1110] rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] p-12 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-3xl">
              🍕
            </div>
            <h2 className="text-lg font-black text-[#190F0E] dark:text-white">No Active Orders Yet</h2>
            <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 max-w-sm mx-auto">
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
                  className="bg-white dark:bg-[#1A1110] rounded-3xl border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs overflow-hidden transition hover:border-[#8E1616]/20"
                >
                  <div className="p-4 sm:p-6 border-b border-[#EBE4D8] dark:border-[#2D1E1B] flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2]/50 dark:bg-[#160D0C]/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center font-black text-sm">
                        #
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#190F0E] dark:text-white">
                            Order {order._id.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              order.status === "delivered"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : order.status === "on_the_way"
                                ? "bg-[#190F0E]/10 text-[#190F0E] dark:bg-zinc-800 dark:text-zinc-200 border border-[#190F0E]/20 dark:border-zinc-700"
                                : order.status === "preparing"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                            }`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">
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
                        className="px-3 py-1.5 rounded-xl border border-[#EBE4D8] dark:border-[#2D1E1B] bg-white dark:bg-[#1E1413] hover:bg-[#FAF7F2] dark:hover:bg-[#2A1C19] text-[#190F0E] dark:text-zinc-200 text-[11px] font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#8E1616]" />
                        <span>Receipt</span>
                      </button>

                      {isPending && (
                        <button
                          disabled={cancellingId === order._id}
                          onClick={() => handleCancelOrder(order._id, order.pizzaName)}
                          className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-[11px] font-bold transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
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
                        <span className="text-xs text-[#6E5F5B] dark:text-zinc-400">Total Amount</span>
                        <div className="text-base font-black text-[#8E1616]">
                          ${order.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-[#EBE4D8] dark:border-[#2D1E1B] bg-[#FAF7F2] dark:bg-[#1E1413]">
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
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6E5F5B] dark:text-zinc-400">
                          <Store className="w-3.5 h-3.5 text-[#8E1616]" />
                          <span>{order.vendorName}</span>
                          <span>•</span>
                          <span>{order.category}</span>
                        </div>
                        <div className="text-xs font-semibold text-[#190F0E] dark:text-zinc-200 pt-1">
                          Quantity: {order.quantity} × ${order.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="bg-[#FAF7F2] dark:bg-[#1E1413] p-3.5 rounded-2xl border border-[#EBE4D8]/80 dark:border-[#2D1E1B] flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#8E1616] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#190F0E] dark:text-white">Delivery Destination</div>
                          <div className="text-[#6E5F5B] dark:text-zinc-200 font-medium leading-relaxed mt-0.5">
                            {order.deliveryAddress}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#FAF7F2] dark:bg-[#1E1413] p-3.5 rounded-2xl border border-[#EBE4D8]/80 dark:border-[#2D1E1B] flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 text-[#8E1616] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#190F0E] dark:text-white">Dispatch Window</div>
                          <div className="text-[#6E5F5B] dark:text-zinc-200 font-medium leading-relaxed mt-0.5">
                            {order.deliverySchedule}
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.bakerNote && (
                      <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-400/50 dark:border-amber-500/40 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 shadow-2xs">
                        <span className="font-black shrink-0 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-[10px] uppercase tracking-wider">
                          Baker Note
                        </span>
                        <span className="leading-relaxed font-semibold text-[#190F0E] dark:text-amber-100">
                          {order.bakerNote}
                        </span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-[#EBE4D8] dark:border-[#2D1E1B]">
                      <div className="text-[11px] font-bold text-[#8E1616] uppercase tracking-wider mb-4 flex items-center justify-between">
                        <span>Dispatch Timeline</span>
                        {isCancelled && (
                          <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1 lowercase">
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
                                  ? "bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-50"
                                  : isStepCompleted
                                  ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40"
                                  : isStepActive
                                  ? "bg-[#8E1616]/5 dark:bg-[#8E1616]/20 border-[#8E1616] ring-1 ring-[#8E1616]/20"
                                  : "bg-[#FAF7F2] dark:bg-[#1E1413] border-[#EBE4D8] dark:border-[#2D1E1B] opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                    isCancelled
                                      ? "bg-stone-200 dark:bg-stone-800 text-stone-500"
                                      : isStepCompleted
                                      ? "bg-emerald-500 text-white"
                                      : isStepActive
                                      ? "bg-[#8E1616] text-white"
                                      : "bg-stone-200 dark:bg-stone-800 text-stone-500"
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[11px] font-bold text-[#190F0E] dark:text-white truncate">
                                  {step.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#6E5F5B] dark:text-zinc-400 leading-tight">
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
