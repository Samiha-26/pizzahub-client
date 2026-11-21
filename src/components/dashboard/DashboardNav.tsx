"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Receipt,
  PlusCircle,
  ShoppingBag,
  Crown,
  User,
  ShieldCheck,
  Flame,
  ChefHat,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  if (!user) return null;

  const isDashboardRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile");

  if (!isDashboardRoute) return null;

  const role = user.role || "customer";

  const adminLinks = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Manage Users", icon: Users },
    { href: "/admin/menu", label: "Manage Menu Items", icon: UtensilsCrossed },
    { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  ];

  const vendorLinks = [
    { href: "/vendor/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/vendor/menu", label: "My Menu Items", icon: UtensilsCrossed },
    { href: "/vendor/add-pizza", label: "Add Menu Item", icon: PlusCircle },
    { href: "/vendor/orders", label: "Customer Orders", icon: ShoppingBag },
    { href: "/vendor/upgrade", label: "Subscription", icon: Crown },
    { href: "/profile", label: "Profile Settings", icon: User },
  ];

  const customerLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/profile", label: "Profile Settings", icon: User },
  ];

  const links =
    role === "admin"
      ? adminLinks
      : role === "vendor"
      ? vendorLinks
      : customerLinks;

  return (
    <div className="w-full bg-white border-b border-[#EBE4D8] sticky top-16 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-2 gap-4">
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {role === "admin" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </span>
            ) : role === "vendor" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                <span>Vendor Kitchen</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#8E1616]/10 text-[#8E1616] text-[11px] font-black uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>Customer Hub</span>
              </span>
            )}
          </div>

          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none w-full md:w-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#8E1616] text-white shadow-xs"
                      : "text-[#6E5F5B] hover:text-[#190F0E] hover:bg-[#FAF7F2]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
