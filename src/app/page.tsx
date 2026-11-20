import DeliveryBar from "@/components/home/DeliveryBar";
import HeroSection from "@/components/home/HeroSection";
import CategoryBar from "@/components/home/CategoryBar";
import ArtisanChefSpecials from "@/components/home/ArtisanChefSpecials";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
      {/* Top Dynamic Delivery Address Bar */}
      <DeliveryBar />

      {/* Hero Banner Section */}
      <HeroSection />

      {/* Crust & Styles Horizontal Category Bar */}
      <CategoryBar />

      {/* Artisan Chef Specials (Featured Pizzas Grid) */}
      <ArtisanChefSpecials />
    </main>
  );
}
