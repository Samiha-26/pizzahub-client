import DeliveryBar from "@/components/home/DeliveryBar";
import HeroSection from "@/components/home/HeroSection";
import CategoryBar from "@/components/home/CategoryBar";
import ArtisanChefSpecials from "@/components/home/ArtisanChefSpecials";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import HowItWorks from "@/components/home/HowItWorks";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
      <DeliveryBar />
      <HeroSection />
      <CategoryBar />
      <ArtisanChefSpecials />
      <WhyChooseUs />
      <HowItWorks />
    </main>
  );
}
