import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("pizzahub_theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${plusJakartaSans.className} antialiased min-h-screen bg-[#FAF7F2] text-[#190F0E] flex flex-col justify-between`}>
        <ToastProvider />
        <CartProvider>
          <CartDrawer />
          <div>
            <Navbar />
            <DashboardLayout>{children}</DashboardLayout>
          </div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
