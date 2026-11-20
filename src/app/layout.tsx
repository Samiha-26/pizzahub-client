import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
