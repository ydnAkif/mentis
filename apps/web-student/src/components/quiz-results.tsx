"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSound } from "@/components/sound-provider";
import { Button } from "@/components/ui/button";

type QuizResultsProps = {
  attemptId: string;
  assignmentId: string;
  quizTitle: string;
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  answeredCount?: number;
};

export function QuizResults({
  attemptId,
  assignmentId,
  quizTitle,
  totalScore,
  correctCount,
  totalQuestions,
  answeredCount,
}: QuizResultsProps) {
  const { play } = useSound();
  const accuracy =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #0F0F23 0%, #1a0933 50%, #0F0F23 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
        className="w-full max-w-md text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-7xl"
        >
          🎉
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Tebrikler!</h1>
          <p className="text-zinc-400 text-sm">{quizTitle}</p>
        </div>

        <div
          className="rounded-3xl p-6 border border-white/10"
          style={{
            background: "rgba(107,43,255,0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p className="text-zinc-400 text-sm mb-2">Toplam Puan</p>
          <motion.p
            className="text-5xl font-bold tabular-nums"
            style={{
              color: "#6B2BFF",
              textShadow: "0 0 40px rgba(107,43,255,0.6)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {totalScore.toLocaleString("tr-TR")}
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4 border border-white/10"
            style={{ background: "rgba(0,208,132,0.1)" }}
          >
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: "#00D084" }}
            >
              {correctCount}/{totalQuestions}
            </p>
            <p className="text-zinc-400 text-sm">Doğru Cevap</p>
          </div>
          <div
            className="rounded-2xl p-4 border border-white/10"
            style={{ background: "rgba(30,144,255,0.1)" }}
          >
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: "#1E90FF" }}
            >
              %{accuracy}
            </p>
            <p className="text-zinc-400 text-sm">Doğruluk</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
          <div className="flex items-center justify-between gap-4">
            <span>Yanıtlanan soru</span>
            <span className="font-semibold text-white">
              {answeredCount ?? totalQuestions}/{totalQuestions}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <span>Deneme No</span>
            <span className="font-mono text-xs text-zinc-400">{attemptId}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button asChild className="w-full">
            <Link
              href={`/leaderboard/${assignmentId}`}
              onClick={() => {
                play("click");
              }}
            >
              Leaderboard
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
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
      </motion.div>
    </main>
  );
}
