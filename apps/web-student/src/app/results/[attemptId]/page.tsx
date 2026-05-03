"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { QuizResults } from "@/components/quiz-results";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/api";
import { useSound } from "@/components/sound-provider";

type ResultDTO = {
  attemptId: string;
  status: string;
  totalScore: number;
  answeredCount: number;
  correctCount: number;
  totalQuestions: number;
  assignmentId: string;
  quizTitle: string;
  studentName: string;
};

type ResultResponse =
  | { ok: true; result: ResultDTO }
  | { ok: false; error: string };

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { play } = useSound();
  const playedFinishRef = useRef(false);
  const [result, setResult] = useState<ResultDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`${API_BASE}/api/attempt/${attemptId}/result`);
        const data = (await res.json()) as ResultResponse;

        if (!data.ok) {
          if (!cancelled) setErr("Sonuç ekranı yüklenemedi.");
          return;
        }

        if (!cancelled) {
          setResult(data.result);
        }
      } catch {
        if (!cancelled) setErr("Sunucuya bağlanılamadı.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  useEffect(() => {
    if (!result || result.status !== "FINISHED" || playedFinishRef.current) {
      return;
    }

    play("finish");
    playedFinishRef.current = true;
  }, [play, result]);

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0F0F23" }}
      >
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Sonuçlar yükleniyor...
        </motion.div>
      </main>
    );
  }

  if (err || !result) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "#0F0F23" }}
      >
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-xl backdrop-blur">
          <div className="text-5xl">⚠️</div>
          <h1 className="mt-4 text-2xl font-bold">Sonuç bulunamadı</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {err ?? "Bu deneme için sonuç bilgisi getirilemedi."}
          </p>
          <Button asChild className="mt-5 w-full">
            <Link
              href="/"
              onClick={() => {
                play("click");
              }}
            >
              Ana Sayfa
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  if (result.status !== "FINISHED") {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "linear-gradient(135deg, #0F0F23 0%, #1a0933 50%, #0F0F23 100%)",
        }}
      >
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-xl backdrop-blur">
          <div className="text-5xl">⏳</div>
          <h1 className="mt-4 text-2xl font-bold">Deneme henüz bitmedi</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {result.studentName} için quiz hâlâ devam ediyor. İstersen kaldığın
            yerden devam edebilirsin.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button asChild>
              <Link
                href={`/play/${result.attemptId}`}
                onClick={() => {
                  play("click");
                }}
              >
                Quiz&apos;e dön
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link
                href="/"
                onClick={() => {
                  play("click");
                }}
              >
                Ana Sayfa
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <QuizResults
      attemptId={result.attemptId}
      assignmentId={result.assignmentId}
      quizTitle={result.quizTitle}
      totalScore={result.totalScore}
      correctCount={result.correctCount}
      totalQuestions={result.totalQuestions}
      answeredCount={result.answeredCount}
    />
  );
}
