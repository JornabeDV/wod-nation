import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, CreditCard, BarChart3, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 px-4 py-24 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Organizá tu competencia de CrossFit sin dolores de cabeza
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300">
            Creá eventos, cobrá inscripciones online, cargá puntajes y mostrá
            tableros de clasificación en tiempo real — todo en un solo lugar.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-zinc-950 hover:bg-zinc-200">
              <Link href="/dashboard/competitions/new">Crear mi competencia</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
              <Link href="#como-funciona">Cómo funciona</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CreditCard className="h-8 w-8 text-primary" />
                <CardTitle className="text-base">Pagos Online</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Los atletas se inscriben y pagan con MercadoPago. Sin efectivo, sin estrés.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                <CardTitle className="text-base">Leaderboard en Vivo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tablero público que se actualiza automáticamente al cargar puntajes.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Trophy className="h-8 w-8 text-primary" />
                <CardTitle className="text-base">Gestión de WODs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Definí workouts, estándares, time caps y tipos de puntuación fácilmente.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Users className="h-8 w-8 text-primary" />
                <CardTitle className="text-base">Autogestión de Atletas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Los atletas se registran solos. Vos solo compartís el link.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="bg-muted px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold">Cómo funciona</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mt-4 font-semibold">Creá y configurá</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Definí tu competencia, categorías y WODs en minutos.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mt-4 font-semibold">Registro y pago</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Compartí el link. Los atletas se registran y pagan online.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mt-4 font-semibold">Puntaje y leaderboard</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Cargá puntajes y el tablero se actualiza al instante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} WODNation. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Términos
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
