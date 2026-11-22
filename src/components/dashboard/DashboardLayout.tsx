"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ChefHat,
  LogOut,
  Sparkles,
  ChevronRight,
  CircleDot,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import toast from "react-hot-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as any;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDashboardRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile");

  if (!isDashboardRoute) {
    return <>{children}</>;
  }

  const role = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/vendor")
    ? "vendor"
    : (user?.role || "customer");

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

  const mobileNavLinks =
    role === "vendor"
      ? [
          { href: "/vendor/dashboard", label: "HQ", icon: LayoutDashboard },
          { href: "/vendor/menu", label: "Menu", icon: UtensilsCrossed },
          { href: "/vendor/orders", label: "Orders", icon: ShoppingBag },
          { href: "/profile", label: "Profile", icon: User },
        ]
      : role === "admin"
      ? [
          { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
          { href: "/admin/users", label: "Users", icon: Users },
          { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
          { href: "/admin/transactions", label: "Finance", icon: Receipt },
        ]
      : [
          { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
          { href: "/orders", label: "Orders", icon: ShoppingBag },
          { href: "/menu", label: "Browse", icon: Sparkles },
          { href: "/profile", label: "Profile", icon: User },
        ];

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully", { icon: "👋" });
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-[#FAF7F2]">
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-white border-r border-[#EBE4D8] shrink-0 sticky top-16 h-[calc(100vh-4rem)] p-5 z-30 shadow-2xs">
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE4D8]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#8E1616] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                {mounted && user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  (mounted && (user?.name || user?.email) ? (user.name || user.email).charAt(0).toUpperCase() : "P")
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-[#190F0E] truncate">
                  {mounted && user?.name ? user.name : role === "admin" ? "Admin Console" : role === "vendor" ? "Vendor Kitchen" : "Artisan Member"}
                </div>
                <div className="text-[11px] text-[#6E5F5B] truncate">
                  {mounted && user?.email ? user.email : "Portal Account"}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#EBE4D8]/70 flex items-center justify-between text-[10px] font-bold">
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <CircleDot className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                Hearth Live &amp; Ready
              </span>
              <span className="uppercase text-[#8E1616] font-black tracking-wide">
                {role}
              </span>
            </div>
          </div>

          <div>
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-[#6E5F5B] flex items-center gap-1.5">
              {role === "admin" ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Admin Console</span>
                </>
              ) : role === "vendor" ? (
                <>
                  <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kitchen Management</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#8E1616]" />
                  <span>Customer Hub</span>
                </>
              )}
            </div>

            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group cursor-pointer ${
                      isActive
                        ? "bg-[#8E1616] text-white shadow-xs"
                        : "text-[#6E5F5B] hover:text-[#190F0E] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#8E1616]"}`} />
                      <span>{link.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="pt-4 border-t border-[#EBE4D8] space-y-1.5">
          <Link
            href="/menu"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#190F0E] hover:bg-[#FAF7F2] transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Explore Pizza Menu</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 pb-20 md:pb-8">
        {children}
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EBE4D8] px-3 py-2 flex items-center justify-around shadow-lg">
        {mobileNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition text-[10px] font-bold ${
                isActive
                  ? "text-[#8E1616]"
                  : "text-[#6E5F5B] hover:text-[#190F0E]"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isActive ? "bg-[#8E1616]/10 text-[#8E1616]" : "text-[#6E5F5B]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
