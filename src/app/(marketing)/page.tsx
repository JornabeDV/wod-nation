import { Hero } from "@/components/landing/Hero";
import { FeaturedCompetitions } from "@/components/landing/FeaturedCompetitions";
import { AthleteFeatures } from "@/components/landing/AthleteFeatures";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturedCompetitions />
      <AthleteFeatures />
      <HowItWorks />
      <Footer />
    </>
  );
}
