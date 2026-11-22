"use client";

import React, { useRef } from "react";
import {
  X,
  Printer,
  FileText,
  Store,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import type { OrderRecord } from "@/lib/api";

interface OrderInvoiceModalProps {
  order: OrderRecord | null;
  onClose: () => void;
}

export default function OrderInvoiceModal({ order, onClose }: OrderInvoiceModalProps) {
  if (!order) return null;

  const invoiceNumber = `PH-${order._id.slice(-6).toUpperCase()}`;
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const handlePrint = () => {
    window.print();
  };

  const unitPrice = order.quantity > 0 ? order.totalPrice / order.quantity : order.totalPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1A1110] rounded-3xl shadow-2xl border border-[#EBE4D8] dark:border-[#2D1E1B] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE4D8] dark:border-[#2D1E1B] bg-[#FAF7F2] dark:bg-[#1E1413] print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8E1616]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#190F0E] dark:text-white">
              Order Receipt &amp; Invoice
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8E1616] hover:bg-[#721212] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-[#251715] text-[#6E5F5B] dark:text-zinc-400 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible">
          <div className="flex items-start justify-between border-b border-[#EBE4D8] dark:border-[#2D1E1B] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#8E1616] flex items-center justify-center text-white text-base font-black shadow-xs">
                  🍕
                </div>
                <span className="text-xl font-black tracking-tight text-[#190F0E] dark:text-white">
                  Pizza<span className="text-[#8E1616] dark:text-[#E25C5C]">Hub</span>
                </span>
              </div>
              <p className="text-[11px] text-[#6E5F5B] dark:text-zinc-400 mt-1">
                Artisanal Wood-Fired Hearth Platform
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-xs font-mono font-black text-[#8E1616] bg-[#8E1616]/10 px-2.5 py-1 rounded-md">
                {invoiceNumber}
              </span>
              <div className="text-[11px] text-[#6E5F5B] dark:text-zinc-400">{formattedDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border-b border-[#EBE4D8] dark:border-[#2D1E1B] pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6E5F5B] dark:text-zinc-400">
                Prepared By
              </span>
              <div className="font-bold text-[#190F0E] dark:text-white flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-[#8E1616]" />
                <span>{order.vendorName || "Artisan Kitchen"}</span>
              </div>
              <div className="text-[#6E5F5B] dark:text-zinc-400 text-[11px]">
                {order.location || "Little Italy, Manhattan, NY"}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6E5F5B] dark:text-zinc-400">
                Delivered To
              </span>
              <div className="font-bold text-[#190F0E] dark:text-white">{order.customerName}</div>
              <div className="text-[#6E5F5B] dark:text-zinc-400 text-[11px]">{order.customerEmail}</div>
              <div className="text-[#6E5F5B] dark:text-zinc-400 text-[11px] line-clamp-1">
                {order.deliveryAddress}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6E5F5B] dark:text-zinc-400 block">
              Itemized Hearth Receipt
            </span>
            <div className="rounded-2xl border border-[#EBE4D8] dark:border-[#2D1E1B] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] dark:bg-[#1E1413] border-b border-[#EBE4D8] dark:border-[#2D1E1B] text-[#6E5F5B] dark:text-zinc-400 text-[10px] uppercase font-black">
                    <th className="py-2.5 px-4">Artisan Item</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4D8] dark:divide-[#2D1E1B]">
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#190F0E] dark:text-white">{order.pizzaName}</div>
                      <div className="text-[10px] text-[#6E5F5B] dark:text-zinc-400">
                        {order.deliverySchedule}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#190F0E] dark:text-white">
                      {order.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-[#6E5F5B] dark:text-zinc-400">
                      ${unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#190F0E] dark:text-white">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#6E5F5B] dark:text-zinc-400">
                <span>Hearth Subtotal</span>
                <span className="font-bold text-[#190F0E] dark:text-white">${order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[#6E5F5B] dark:text-zinc-400">
                <span>Insulated Packaging</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Free</span>
              </div>
              <div className="flex items-center justify-between text-[#6E5F5B] dark:text-zinc-400">
                <span>Artisan Dispatch Fee</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Included</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#EBE4D8] dark:border-[#2D1E1B] text-sm font-black text-[#190F0E] dark:text-white">
                <span>Total Amount Paid</span>
                <span className="text-[#8E1616] dark:text-[#E25C5C]">${order.totalPrice.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {order.bakerNote && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-400/50 dark:border-amber-500/40 text-xs space-y-1 shadow-2xs">
              <span className="font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-[10px] uppercase tracking-wider inline-block">
                Baker Preparation Note
              </span>
              <p className="text-[#190F0E] dark:text-amber-100 font-medium leading-relaxed">{order.bakerNote}</p>
            </div>
          )}

          <div className="text-center text-[10px] text-[#6E5F5B] dark:text-zinc-400 pt-4 border-t border-[#EBE4D8] dark:border-[#2D1E1B]">
            Thank you for supporting authentic artisanal pizzerias on PizzaHub!
          </div>
        </div>
      </div>
    </div>
  );
}
