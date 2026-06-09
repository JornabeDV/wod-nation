import { OrganizerHero } from "@/components/landing/OrganizerHero";
import { LogoStrip } from "@/components/landing/LogoStrip";
import { Features } from "@/components/landing/Features";
import { LivePreview } from "@/components/landing/LivePreview";
import { OrganizerHowItWorks } from "@/components/landing/OrganizerHowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { OrganizerCTA } from "@/components/landing/OrganizerCTA";
import { Footer } from "@/components/landing/Footer";

export default function OrganizerLandingPage() {
  return (
    <>
      <OrganizerHero />
      <LogoStrip />
      <Features />
      <LivePreview />
      <OrganizerHowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <OrganizerCTA />
      <Footer />
    </>
  );
}
