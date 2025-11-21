import HeroSection from "@/app/components/HeroSection";
import Features from "@/app/components/Features";
import DemoSection from "@/app/components/DemoSection";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Section 1: Hero 
        (Sudah memiliki padding-top bawaan untuk kompensasi Fixed Navbar) 
      */}
      <HeroSection />

      {/* Section 2: Features Grid */}
      <Features />

      {/* Section 3: Live Simulation */}
      <DemoSection />
    </div>
  );
}