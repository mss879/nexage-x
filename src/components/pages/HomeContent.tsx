import React from "react";
import HeroWithPreloader from "@/components/sections/HeroWithPreloader";
import AboutUs from "@/components/sections/AboutUs";
import Services from "@/components/sections/Services";
import WhyChooseMe from "@/components/sections/WhyChooseMe";
import FeatureTicker from "@/components/sections/FeatureTicker";
import Projects from "@/components/sections/Projects";
import Methodology from "@/components/sections/Methodology";
import Benefits from "@/components/sections/Benefits";
import Values from "@/components/sections/Values";
import Footer from "@/components/Footer";

export default function HomeContent() {
  return (
    <main className="relative min-h-screen w-full bg-[#050508] overflow-x-hidden">
      <HeroWithPreloader />
      
      {/* Scroll Stack Overlay Container (Starts 100vh down, covers fixed Hero on scroll) */}
      <div className="relative z-10 w-full bg-[#F5F5F7] shadow-[0_-30px_60px_rgba(0,0,0,0.18)] mt-[100vh] rounded-t-[32px] md:rounded-t-[48px] lg:rounded-t-[56px] overflow-hidden">
        {/* Section 2: About Us */}
        <AboutUs />
        
        {/* Section 3: Why Choose Me */}
        <WhyChooseMe />

        {/* Dynamic crossing ticker section */}
        <FeatureTicker />

        {/* Section 4: Services (What We Do) */}
        <Services />

        {/* Section: Projects (Recent Work Showcase) */}
        <Projects />

        {/* Section: Our Values (WebGL aurora + GSAP) — sits above the process */}
        <Values />

        {/* Section 5: Methodology (How We Work / Our Process) */}
        <Methodology />

        {/* Section 6: Benefits (Creative Partners Who You Can Trust) */}
        <Benefits />

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
