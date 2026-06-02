import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterSuccessPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">¡Inscripción confirmada!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Tu inscripción fue procesada correctamente. Te esperamos en el evento.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
