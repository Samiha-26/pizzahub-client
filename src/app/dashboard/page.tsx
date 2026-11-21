"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  User,
  MapPin,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getMyOrders, type OrderRecord } from "@/lib/api";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user as any;

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSessionPending) {
      if (!user) {
        router.push("/signin?redirect=/dashboard");
        return;
      }
      if (user.role === "admin") {
        router.push("/admin/dashboard");
        return;
      }
      if (user.role === "vendor") {
        router.push("/vendor/dashboard");
        return;
      }

      if (user.email) {
        getMyOrders(user.email)
          .then((data) => setOrders(data))
          .catch(() => setOrders([]))
          .finally(() => setLoading(false));
      }
    }
  }, [isSessionPending, user, router]);

  if (isSessionPending || loading) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-9 h-9 animate-spin text-[#8E1616]" />
          <p className="text-sm font-semibold text-[#6E5F5B]">
            Loading your customer dashboard...
          </p>
        </div>
      </main>
    );
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const acceptedOrders = orders.filter((o) => o.status === "preparing" || o.status === "on_the_way" || o.status === "delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

  return (
    <main className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E1616] uppercase tracking-wider mb-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
              <span>•</span>
              <span className="text-[#6E5F5B]">Artisan Dining</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] tracking-tight">
              Welcome back, {user?.name || "Pizza Connoisseur"}!
            </h1>
            <p className="text-xs text-[#6E5F5B] mt-1">
              Track live wood-fired orders, inspect itemized receipts, and manage your delivery preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className="px-4 py-2.5 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-xs font-bold text-white flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Pizza Menu</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B]">
              <span>Total Orders</span>
              <div className="w-8 h-8 rounded-xl bg-[#190F0E]/10 text-[#190F0E] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#190F0E]">{totalOrders}</div>
            <div className="text-[11px] text-[#6E5F5B]">All-time placed pies</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B]">
              <span>Pending</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600">{pendingOrders}</div>
            <div className="text-[11px] text-[#6E5F5B]">Awaiting hearth accept</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B]">
              <span>Accepted / Baking</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700">{acceptedOrders}</div>
            <div className="text-[11px] text-[#6E5F5B]">Active in wood-fire hearth</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E5F5B]">
              <span>Cancelled</span>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-red-600">{cancelledOrders}</div>
            <div className="text-[11px] text-[#6E5F5B]">Cancelled tickets</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/orders"
            className="bg-white p-6 rounded-3xl border border-[#EBE4D8] hover:border-[#8E1616]/40 transition shadow-2xs group flex flex-col justify-between h-40 cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mb-3 group-hover:bg-[#8E1616] group-hover:text-white transition">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#190F0E] group-hover:text-[#8E1616] transition">
                My Orders &amp; Live Timeline
              </h3>
              <p className="text-xs text-[#6E5F5B] mt-1">
                Track status across hearth wood-firing, delivery courier, and print invoices.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#8E1616]">
              <span>Open Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/profile"
            className="bg-white p-6 rounded-3xl border border-[#EBE4D8] hover:border-[#8E1616]/40 transition shadow-2xs group flex flex-col justify-between h-40 cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#190F0E] group-hover:text-[#8E1616] transition">
                Profile &amp; Delivery Settings
              </h3>
              <p className="text-xs text-[#6E5F5B] mt-1">
                Manage your saved delivery address, telephone contact, and delivery notes.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#8E1616]">
              <span>Edit Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/menu"
            className="bg-white p-6 rounded-3xl border border-[#EBE4D8] hover:border-[#8E1616]/40 transition shadow-2xs group flex flex-col justify-between h-40 cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#190F0E] group-hover:text-[#8E1616] transition">
                Order Another Artisan Pie
              </h3>
              <p className="text-xs text-[#6E5F5B] mt-1">
                Browse 72h cold fermented sourdough recipes and wood-fired chef specials.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#8E1616]">
              <span>Browse Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-[#EBE4D8] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#190F0E]">Recent Order Dispatches</h2>
            <Link
              href="/orders"
              className="text-xs font-bold text-[#8E1616] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#6E5F5B]">
              You haven&apos;t placed any orders yet. Discover our artisanal menu!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#EBE4D8] text-[10px] uppercase font-bold text-[#6E5F5B]">
                    <th className="pb-3">Pizza</th>
                    <th className="pb-3">Vendor</th>
                    <th className="pb-3">Delivery Window</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4D8]/60">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="hover:bg-[#FAF7F2]/50">
                      <td className="py-3 font-bold text-[#190F0E]">{order.pizzaName}</td>
                      <td className="py-3 text-[#6E5F5B]">{order.vendorName}</td>
                      <td className="py-3 text-[#6E5F5B]">{order.deliverySchedule}</td>
                      <td className="py-3 font-black text-[#8E1616]">${order.totalPrice.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          order.status === "delivered"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : order.status === "cancelled"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
