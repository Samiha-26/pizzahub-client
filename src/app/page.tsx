import DeliveryBar from "@/components/home/DeliveryBar";
import HeroSection from "@/components/home/HeroSection";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Delivery Address Bar */}
      <DeliveryBar />

      {/* Hero Banner Section */}
      <HeroSection />
    </main>
  );
}
