"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HelpCircle, PlaySquare } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ classes: 0, quizzes: 0, assignments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we would fetch stats from an API endpoint
    // For now we just mock
    setStats({
      classes: 2,
      quizzes: 5,
      assignments: 12
    });
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Genel Bakış</h2>
        <p className="text-zinc-400 mt-1">Öğretmen panelinize hoş geldiniz.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Toplam Sınıf</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{loading ? "-" : stats.classes}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Toplam Quiz</CardTitle>
            <HelpCircle className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{loading ? "-" : stats.quizzes}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Aktif/Biten Atamalar</CardTitle>
            <PlaySquare className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{loading ? "-" : stats.assignments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for recent activity */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-zinc-100">Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">Henüz bir aktivite bulunmuyor.</p>
        </CardContent>
      </Card>
    </div>
  );
}
