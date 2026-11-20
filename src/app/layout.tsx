import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";

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
      <body className={`${plusJakartaSans.className} antialiased min-h-screen bg-[#FAF7F2] text-[#190F0E]`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
