import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bienvenido a WODNation",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {children}
    </div>
  );
}
