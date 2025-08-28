'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EconomyPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion de l'Économie</h1>
          <p className="text-muted-foreground">
            Supervisez l'économie de votre serveur MMO RPG
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Section Economy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cette section sera développée ultérieurement.
              Structure préparée pour l'ajout de fonctionnalités.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}