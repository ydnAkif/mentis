"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Clock, Image as ImageIcon, CheckCircle2 } from "lucide-react";

type Question = {
  id: string;
  text: string;
  a: string;
  b: string;
  c: string;
  d: string;
  correct: "A" | "B" | "C" | "D";
  timeLimitSec: number;
};

export default function QuizBuilderPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      text: "İlk sorunuzu buraya yazın...",
      a: "1. Seçenek",
      b: "2. Seçenek",
      c: "3. Seçenek",
      d: "4. Seçenek",
      correct: "A",
      timeLimitSec: 30,
    }
  ]);
  const [activeQuestionId, setActiveQuestionId] = useState<string>("1");

  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  const addQuestion = () => {
    const newId = Math.random().toString(36).substring(7);
    setQuestions([
      ...questions,
      {
        id: newId,
        text: "Yeni soru",
        a: "Seçenek A",
        b: "Seçenek B",
        c: "Seçenek C",
        d: "Seçenek D",
        correct: "A",
        timeLimitSec: 30,
      }
    ]);
    setActiveQuestionId(newId);
  };

  const updateQuestion = (field: keyof Question, value: any) => {
    if (!activeQuestion) return;
    const newQuestions = questions.map(q => 
      q.id === activeQuestionId ? { ...q, [field]: value } : q
    );
    setQuestions(newQuestions);
  };

  if (!activeQuestion) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Quiz Düzenleyici</h2>
          <p className="text-zinc-400 mt-1">Sorularınızı ekleyin ve doğru cevapları işaretleyin.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">İptal</Button>
          <Button className="bg-purple-600 hover:bg-purple-500 text-white">Kaydet</Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar for questions */}
        <div className="w-64 flex flex-col gap-3 overflow-y-auto pr-2">
          {questions.map((q, index) => (
            <Card 
              key={q.id} 
              className={`cursor-pointer transition-all ${
                activeQuestionId === q.id 
                  ? "bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/50" 
                  : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800"
              }`}
              onClick={() => setActiveQuestionId(q.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <span className="font-medium text-sm text-zinc-300">{index + 1}. Soru</span>
                <Trash2 className="w-4 h-4 text-zinc-600 hover:text-red-400" />
              </CardContent>
            </Card>
          ))}
          <Button 
            onClick={addQuestion}
            variant="outline" 
            className="w-full border-dashed border-zinc-700 bg-transparent hover:bg-zinc-900 text-zinc-400 py-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Soru Ekle
          </Button>
        </div>

        {/* Main Editor */}
        <Card className="flex-1 bg-zinc-900/50 border-zinc-800 overflow-y-auto">
          <CardContent className="p-8 space-y-8">
            {/* Question Text */}
            <div className="space-y-3">
              <Label className="text-zinc-400">Soru Metni</Label>
              <Input 
                value={activeQuestion.text}
                onChange={(e) => updateQuestion("text", e.target.value)}
                className="text-lg py-6 bg-zinc-950/50 border-zinc-800 text-zinc-100"
                placeholder="Örn: Türkiye'nin başkenti neresidir?"
              />
            </div>

            {/* Media & Time Limit */}
            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                <Label className="text-zinc-400">Görsel (Opsiyonel)</Label>
                <div className="h-32 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:border-purple-500/50 hover:text-purple-400 transition-colors cursor-pointer bg-zinc-950/30">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm">Görsel Yükle</span>
                </div>
              </div>
              <div className="w-48 space-y-3">
                <Label className="text-zinc-400">Süre Limiti (sn)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input 
                    type="number" 
                    value={activeQuestion.timeLimitSec}
                    onChange={(e) => updateQuestion("timeLimitSec", parseInt(e.target.value) || 30)}
                    className="pl-9 bg-zinc-950/50 border-zinc-800 text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Label className="text-zinc-400">Şıklar (Doğru cevabı işaretleyin)</Label>
              <div className="grid grid-cols-2 gap-4">
                {(["A", "B", "C", "D"] as const).map((opt) => (
                  <div 
                    key={opt}
                    className={`relative flex items-center rounded-xl border p-2 transition-all ${
                      activeQuestion.correct === opt 
                        ? "border-green-500/50 bg-green-500/10" 
                        : "border-zinc-800 bg-zinc-950/50"
                    }`}
                  >
                    <button
                      onClick={() => updateQuestion("correct", opt)}
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-3 font-bold transition-colors ${
                        activeQuestion.correct === opt
                          ? "bg-green-500 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {activeQuestion.correct === opt ? <CheckCircle2 className="w-5 h-5" /> : opt}
                    </button>
                    <Input 
                      value={activeQuestion[opt.toLowerCase() as keyof Question] as string}
                      onChange={(e) => updateQuestion(opt.toLowerCase() as keyof Question, e.target.value)}
                      className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 text-zinc-200"
                      placeholder={`${opt} Seçeneği`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
