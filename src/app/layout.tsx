import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Footer from "@/components/shared/Footer";
import ToastProvider from "@/components/shared/ToastProvider";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/shared/CartDrawer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "PizzaHub — Artisanal Pizza Ordering & Delivery Platform",
  description: "Hot & Fresh Wood-Fired Pizza Delivered to Your Door",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.className} antialiased min-h-screen bg-[#FAF7F2] text-[#190F0E] flex flex-col justify-between`}>
        <ToastProvider />
        <CartProvider>
          <CartDrawer />
          <div>
            <Navbar />
            <DashboardNav />
            {children}
          </div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
