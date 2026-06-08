"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/provider";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const d = t.dashboard.profilePage;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{d.title}</h1>
        <p className="text-muted-foreground">{d.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{d.accountTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{d.name}</Label>
            <Input value={session?.user?.name || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>{d.email}</Label>
            <Input value={session?.user?.email || ""} disabled />
          </div>
          <p className="text-xs text-muted-foreground">
            {d.editingSoon}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
