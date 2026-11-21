"use client";

import React, { useState } from "react";
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
  Flame,
  ChefHat,
  LogOut,
  Sparkles,
  ChevronRight,
  Menu,
  X,
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isDashboardRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile");

  if (!isDashboardRoute) {
    return <>{children}</>;
  }

  const role = user?.role || "customer";

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
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#FAF7F2]">
      <aside className="hidden lg:flex flex-col justify-between w-64 xl:w-72 bg-white border-r border-[#EBE4D8] shrink-0 sticky top-16 h-[calc(100vh-4rem)] p-5 z-30 shadow-2xs">
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE4D8] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#8E1616] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  (user?.name || user?.email || "U").charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-[#190F0E] truncate">
                  {user?.name || "Artisan Member"}
                </div>
                <div className="text-[10px] text-[#6E5F5B] truncate">
                  {user?.email || "Signed In"}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-[#6E5F5B] flex items-center gap-1.5">
              {role === "admin" ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-purple-700" />
                  <span>Admin Console</span>
                </>
              ) : role === "vendor" ? (
                <>
                  <ChefHat className="w-3 h-3 text-amber-600" />
                  <span>Kitchen Management</span>
                </>
              ) : (
                <>
                  <Flame className="w-3 h-3 text-[#8E1616]" />
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

        <div className="pt-4 border-t border-[#EBE4D8] space-y-2">
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

      <div className="lg:hidden w-full bg-white border-b border-[#EBE4D8] sticky top-16 z-30 shadow-2xs">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#8E1616]/10 text-[#8E1616]">
              {role === "admin" ? "Admin Console" : role === "vendor" ? "Vendor Kitchen" : "Customer Hub"}
            </span>
            <span className="text-xs font-bold text-[#190F0E] truncate max-w-[160px]">
              {user?.name}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-1.5 rounded-lg border border-[#EBE4D8] text-gray-700 hover:bg-gray-100"
            aria-label="Toggle Dashboard Menu"
          >
            {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {mobileDrawerOpen ? (
          <div className="p-3 bg-[#FAF7F2] border-t border-[#EBE4D8] space-y-1 animate-in slide-in-from-top-2 duration-150">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#8E1616] text-white shadow-xs"
                      : "text-[#6E5F5B] hover:text-[#190F0E] hover:bg-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
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
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
