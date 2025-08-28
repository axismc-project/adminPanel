'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Coins, 
  Globe, 
  Server,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    onlinePlayers: 0,
    totalEconomy: 0,
    serverUptime: '0h 0m'
  });

  // Simulation de données - à remplacer par de vraies données
  useEffect(() => {
    setStats({
      totalPlayers: 1247,
      onlinePlayers: 89,
      totalEconomy: 2456789,
      serverUptime: '7d 14h 23m'
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre serveur MMO RPG Minecraft
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Joueurs Total
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlayers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+12%</span> ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Joueurs En Ligne
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.onlinePlayers}</div>
              <p className="text-xs text-muted-foreground">
                Pic: 156 joueurs aujourd'hui
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Économie Totale
              </CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEconomy.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-500">+8%</span> cette semaine
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Uptime Serveur
              </CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.serverUptime}</div>
              <p className="text-xs text-muted-foreground">
                99.9% de disponibilité
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques et activités récentes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Activité des Joueurs</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Graphique d'activité (à implémenter)
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Nouveau joueur inscrit
                    </p>
                    <p className="text-sm text-muted-foreground">
                      DragonSlayer2024
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    Il y a 2m
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Transaction économique
                    </p>
                    <p className="text-sm text-muted-foreground">
                      +15,000 pièces d'or
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    Il y a 5m
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Zone monde créée
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Forêt Enchantée
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    Il y a 12m
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}