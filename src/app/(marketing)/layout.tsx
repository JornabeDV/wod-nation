import { Navigation } from "@/components/landing/Navigation";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="relative">{children}</main>
    </>
  );
}
