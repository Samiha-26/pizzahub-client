"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  ChefHat,
  ShieldAlert,
  Clock,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  UtensilsCrossed,
  Crown,
  User,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { getVendorStats } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as any;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isVendorPremium, setIsVendorPremium] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role === "vendor" && user?.email) {
      getVendorStats(user.email)
        .then((data) => {
          setIsVendorPremium(data.subscriptionTier === "premium");
        })
        .catch(() => {});
    }
  }, [user?.role, user?.email, pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
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

  const getDashboardLink = () => {
    if (!user) return "/signin";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "vendor") return "/vendor/dashboard";
    return "/orders";
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#EFE7DE] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8E1616] to-[#D97706] p-0.5 shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#190F0E] rounded-[10px] flex items-center justify-center text-lg text-white">
              🍕
            </div>
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-[#190F0E]">
              Pizza<span className="text-[#8E1616]">Hub</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-[#6E5F5B] font-bold -mt-1">
              Artisan Network
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#190F0E]">
          <Link
            href="/"
            className={`hover:text-[#8E1616] transition ${
              pathname === "/" ? "text-[#8E1616]" : "text-[#6E5F5B]"
            }`}
          >
            Home
          </Link>
          <Link
            href="/menu"
            className={`hover:text-[#8E1616] transition ${
              pathname.startsWith("/menu") ? "text-[#8E1616]" : "text-[#6E5F5B]"
            }`}
          >
            Browse Menu
          </Link>
          {user && (
            <Link
              href={getDashboardLink()}
              className={`hover:text-[#8E1616] transition ${
                pathname.startsWith("/vendor") || pathname.startsWith("/admin") || pathname.startsWith("/orders")
                  ? "text-[#8E1616]"
                  : "text-[#6E5F5B]"
              }`}
            >
              {user.role === "vendor" ? "Kitchen Portal" : user.role === "admin" ? "Admin Console" : "My Orders"}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/menu"
            className="relative w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE] flex items-center justify-center text-[#190F0E] hover:bg-gray-100 transition"
            title="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8E1616] text-white text-[10px] font-bold flex items-center justify-center">
              0
            </span>
          </Link>

          {!user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/signin"
                className="px-3.5 py-1.5 rounded-xl border border-[#EFE7DE] text-[#190F0E] text-xs font-bold hover:bg-[#FAF7F2] transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-xl bg-[#8E1616] hover:bg-[#751111] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-[#FAF7F2] hover:bg-gray-100 rounded-full border border-[#EFE7DE] text-xs transition"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#8E1616] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-bold text-[#190F0E] max-w-[110px] truncate hidden sm:inline-block">
                  {user.name || user.email?.split("@")[0]}
                </span>
                {user.role === "admin" && (
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-black rounded-md uppercase">
                    Admin
                  </span>
                )}
                {user.role === "vendor" && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-black rounded-md uppercase flex items-center gap-1 ${
                      isVendorPremium
                        ? "bg-amber-500 text-white shadow-2xs"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isVendorPremium && <Crown className="w-2.5 h-2.5 fill-current" />}
                    <span>{isVendorPremium ? "Premium" : "Vendor"}</span>
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#EFE7DE] shadow-xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2.5 border-b border-[#EFE7DE]">
                    <div className="font-black text-[#190F0E] truncate">{user.name || "Pizza Connoisseur"}</div>
                    <div className="text-[11px] text-[#6E5F5B] truncate">{user.email}</div>
                    {(user.role === "admin" || user.role === "vendor") && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {user.role === "admin" && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
                            Platform Admin
                          </span>
                        )}
                        {user.role === "vendor" && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 ${
                              isVendorPremium
                                ? "bg-amber-500 text-white shadow-2xs"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isVendorPremium && <Crown className="w-3 h-3 fill-current" />}
                            <span>{isVendorPremium ? "Premium Master Baker" : "Pizzeria Partner"}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="py-1">
                    {user.role === "admin" && (
                      <>
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#190F0E] hover:bg-[#FAF7F2] font-semibold"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#8E1616]" />
                          <span>Admin Console</span>
                        </Link>
                        <Link
                          href="/admin/users"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#190F0E] hover:bg-[#FAF7F2] font-semibold"
                        >
                          <ShieldAlert className="w-4 h-4 text-[#8E1616]" />
                          <span>User Management</span>
                        </Link>
                      </>
                    )}

                    {user.role === "vendor" && (
                      <>
                        <Link
                          href="/vendor/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#190F0E] hover:bg-[#FAF7F2] font-semibold"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#8E1616]" />
                          <span>Kitchen Dashboard</span>
                        </Link>
                        <Link
                          href="/vendor/menu"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#190F0E] hover:bg-[#FAF7F2] font-semibold"
                        >
                          <UtensilsCrossed className="w-4 h-4 text-[#8E1616]" />
                          <span>Menu Catalog</span>
                        </Link>
                        <Link
                          href="/vendor/orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#190F0E] hover:bg-[#FAF7F2] font-semibold"
                        >
                          <Clock className="w-4 h-4 text-[#8E1616]" />
                          <span>Kitchen Queue</span>
                        </Link>
                        <Link
                          href="/vendor/upgrade"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-700 hover:bg-amber-50 font-bold"
                        >
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Upgrade to Premium</span>
                        </Link>
                      </>
                    )}

                    {(!user.role || user.role === "customer") && (
                      <>
                        <Link
                          href="/orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#190F0E] hover:bg-[#FAF7F2] font-semibold"
                        >
                          <Clock className="w-4 h-4 text-[#8E1616]" />
                          <span>My Pizza Orders</span>
                        </Link>
                        <Link
                          href="/menu"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#190F0E] hover:bg-[#FAF7F2] font-semibold"
                        >
                          <UtensilsCrossed className="w-4 h-4 text-[#8E1616]" />
                          <span>Browse Full Menu</span>
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[#EFE7DE]">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#190F0E] hover:bg-[#FAF7F2] font-semibold"
                    >
                      <User className="w-4 h-4 text-[#8E1616]" />
                      <span>Profile &amp; Settings</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EFE7DE] px-4 py-4 space-y-3 text-xs font-bold">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#190F0E] hover:text-[#8E1616]"
          >
            Home
          </Link>
          <Link
            href="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#190F0E] hover:text-[#8E1616]"
          >
            Browse Menu
          </Link>
          {!user ? (
            <div className="pt-2 border-t border-[#EFE7DE] flex gap-2">
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center border border-[#EFE7DE] rounded-xl text-xs"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center bg-[#8E1616] text-white rounded-xl text-xs font-bold"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#EFE7DE] space-y-2">
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#8E1616]"
              >
                {user.role === "vendor" ? "Kitchen Dashboard" : user.role === "admin" ? "Admin Console" : "My Orders"}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left py-2 text-red-600 font-bold"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
