import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus } from "lucide-react";

export default function QuizzesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Quizler</h2>
          <p className="text-zinc-400 mt-1">Kendi quizlerinizi oluşturun ve düzenleyin.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Quiz
        </Button>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium text-zinc-200">Henüz Quiz Yok</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm">
            Sorularınızı hazırlayın ve öğrencilerinizi test etmeye başlayın.
          </p>
          <Button variant="outline" className="mt-6 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
            İlk Quizi Oluştur
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
