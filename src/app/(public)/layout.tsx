export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center">
          <a href="/" className="text-lg font-bold">
            WODNation
          </a>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
