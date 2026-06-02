"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">Tus datos de organizador.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={session?.user?.name || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={session?.user?.email || ""} disabled />
          </div>
          <p className="text-xs text-muted-foreground">
            La edición de perfil estará disponible próximamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
