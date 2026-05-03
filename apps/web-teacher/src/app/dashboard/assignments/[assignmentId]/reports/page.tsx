import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, CheckCircle, XCircle } from "lucide-react";

export default function ReportsPage() {
  // Mock veri
  const stats = {
    totalStudents: 24,
    averageScore: 78,
    highestScore: 100,
    lowestScore: 40,
  };

  const topQuestions = [
    { id: 1, text: "Güneş sistemindeki en büyük gezegen hangisidir?", correctPercent: 95 },
    { id: 2, text: "Işık hızı saniyede yaklaşık kaç kilometredir?", correctPercent: 82 },
    { id: 3, text: "Suyun kimyasal formülü nedir?", correctPercent: 100 },
  ];

  const hardQuestions = [
    { id: 4, text: "Kuantum dolanıklık nedir?", correctPercent: 30 },
    { id: 5, text: "Kara deliklerin olay ufku nedir?", correctPercent: 45 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Sınav Raporu</h2>
        <p className="text-zinc-400 mt-1">Fen Bilimleri Quiz 1 sonuçları ve analizi.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Katılan Öğrenci</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Sınıf Ortalaması</CardTitle>
            <BarChart3 className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{stats.averageScore} Puan</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-green-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">En Yüksek Puan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{stats.highestScore}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-red-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">En Düşük Puan</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{stats.lowestScore}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Most correctly answered */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-green-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> En Çok Doğru Bilinen Sorular
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topQuestions.map(q => (
              <div key={q.id} className="flex flex-col gap-2 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-zinc-200 line-clamp-2">{q.text}</span>
                  <span className="font-bold text-green-400">%{q.correctPercent}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${q.correctPercent}%` }}></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Most incorrectly answered */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-red-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> En Çok Hata Yapılan Sorular
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hardQuestions.map(q => (
              <div key={q.id} className="flex flex-col gap-2 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-zinc-200 line-clamp-2">{q.text}</span>
                  <span className="font-bold text-red-400">%{100 - q.correctPercent} hata</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${100 - q.correctPercent}%` }}></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
