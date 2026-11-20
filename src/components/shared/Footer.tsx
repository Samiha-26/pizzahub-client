import React from "react";
import Link from "next/link";
import { Flame, MapPin, Phone, Mail, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#EFE7DE] mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#EFE7DE]">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[#8E1616] flex items-center justify-center text-white shadow-md shadow-[#8E1616]/20">
                <span className="text-xl">🍕</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-[#190F0E]">
                  Pizza<span className="text-[#8E1616]">Hub</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-[#6E5F5B] uppercase">
                  Artisan Wood-Fired Pies
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#6E5F5B] max-w-sm leading-relaxed">
              Every pie is hand-stretched and baked in authentic 450°C refractory stone hearths. Delivered piping hot in micro-vented thermal boxes.
            </p>

            <div className="space-y-2 text-xs text-[#6E5F5B] pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8E1616] shrink-0" />
                <span>Gulshan-2 • Banani 11 • Dhanmondi Lakefront</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#8E1616] shrink-0" />
                <span>+880 1712-PIZZAHUB (9 AM - 2 AM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8E1616] shrink-0" />
                <span>orders@pizzahub.com</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#190F0E]">
              Artisan Catalog
            </h4>
            <ul className="space-y-2 text-xs text-[#6E5F5B]">
              <li>
                <Link href="/menu?category=Wood-Fired" className="hover:text-[#8E1616] transition-colors">
                  Wood-Fired Classics
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Classic+Italian" className="hover:text-[#8E1616] transition-colors">
                  Neapolitan D.O.P.
                </Link>
              </li>
              <li>
                <Link href="/menu?category=White+Base" className="hover:text-[#8E1616] transition-colors">
                  White Truffle Crema
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Spicy+%26+Fiery" className="hover:text-[#8E1616] transition-colors">
                  Calabrian 'Nduja & Chili
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Vegetarian+%26+Plant" className="hover:text-[#8E1616] transition-colors">
                  Plant-Forward &amp; Vegan
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#190F0E]">
              Crust &amp; Dough
            </h4>
            <ul className="space-y-2 text-xs text-[#6E5F5B]">
              <li>
                <Link href="/menu?crust=Neapolitan+48h" className="hover:text-[#8E1616] transition-colors">
                  48-Hour Cold Ferment
                </Link>
              </li>
              <li>
                <Link href="/menu?crust=Roman+Thin+Crust" className="hover:text-[#8E1616] transition-colors">
                  Crispy Roman Scrocchiarella
                </Link>
              </li>
              <li>
                <Link href="/menu?crust=Detroit+Pan" className="hover:text-[#8E1616] transition-colors">
                  Detroit Frico Cheddar Edge
                </Link>
              </li>
              <li>
                <Link href="/menu?crust=Gluten-Free+Cauliflower" className="hover:text-[#8E1616] transition-colors">
                  Gluten-Free Hearth Crust
                </Link>
              </li>
              <li>
                <Link href="/menu?crust=Sourdough+Stuffed" className="hover:text-[#8E1616] transition-colors">
                  Ricotta Stuffed Crust
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#190F0E]">
              Partners &amp; Portals
            </h4>
            <ul className="space-y-2 text-xs text-[#6E5F5B]">
              <li>
                <Link href="/vendor/dashboard" className="hover:text-[#8E1616] transition-colors">
                  Vendor Kitchen Portal
                </Link>
              </li>
              <li>
                <Link href="/vendor/upgrade" className="hover:text-[#8E1616] transition-colors">
                  Upgrade to Premium ($29/mo)
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#8E1616] transition-colors">
                  Track Live Orders
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-[#8E1616] transition-colors">
                  Platform Admin Portal
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[#8E1616] transition-colors">
                  Join as Artisan Pizzeria
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E5F5B]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Stone-Fired Authenticity Guaranteed</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EFE7DE] flex items-center justify-center hover:bg-[#8E1616] hover:text-white transition-all text-[#190F0E]"
              aria-label="X (formerly Twitter)"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EFE7DE] flex items-center justify-center hover:bg-[#8E1616] hover:text-white transition-all text-[#190F0E]"
              aria-label="Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EFE7DE] flex items-center justify-center hover:bg-[#8E1616] hover:text-white transition-all text-[#190F0E]"
              aria-label="GitHub"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} PizzaHub Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
