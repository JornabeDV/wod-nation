import { MarketingNav } from "@/components/layout/marketing-nav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingNav />
      <main className="flex-1">{children}</main>
    </>
  );
}
