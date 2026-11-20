"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  User, 
  LogIn, 
  UserPlus 
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth state placeholder (will connect to Better Auth session in Auth step)
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: "customer" | "vendor" | "admin";
    image?: string;
  } | null>(null);

  const getDashboardLink = () => {
    if (!user) return "/signin";
    if (user.role === "vendor") return "/dashboard/vendor";
    if (user.role === "admin") return "/dashboard/admin";
    return "/dashboard/customer";
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#EFE7DE] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
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

        {/* Public Navigation Links */}
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
              className="text-[#6E5F5B] hover:text-[#8E1616] transition"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Actions: Public Sign In / Sign Up OR User Profile Dropdown */}
        <div className="flex items-center gap-3">
          
          {/* Cart Icon */}
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

          {/* Logged Out View */}
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
            /* Logged In View: Avatar & Dashboard link */
            <div className="flex items-center gap-2">
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2 px-3 py-1 bg-[#FAF7F2] rounded-full border border-[#EFE7DE] text-xs hover:bg-gray-100 transition"
              >
                <div className="w-6 h-6 rounded-full bg-[#8E1616] text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-[#190F0E]">{user.name}</span>
                <span className="px-1.5 py-0.2 bg-[#FEE2E2] text-[#8E1616] text-[9px] font-black rounded uppercase">
                  {user.role}
                </span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EFE7DE] px-4 py-4 space-y-3 text-xs font-bold">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#190F0E] hover:text-[#8E1616]"
          >
            🏠 Home
          </Link>
          <Link
            href="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#190F0E] hover:text-[#8E1616]"
          >
            🍕 Browse Menu
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
            <Link
              href={getDashboardLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#8E1616]"
            >
              📊 Go to {user.role.toUpperCase()} Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
