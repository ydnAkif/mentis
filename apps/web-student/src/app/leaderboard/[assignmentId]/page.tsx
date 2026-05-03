"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/api";
import { useSound } from "@/components/sound-provider";

type LeaderboardItem = {
  rank: number;
  attemptId: string;
  name: string;
  score: number;
  status: string;
};

type LeaderboardResponse =
  | {
      ok: true;
      assignmentId: string;
      quizTitle: string;
      leaderboard: LeaderboardItem[];
    }
  | { ok: false; error: string };

export default function LeaderboardPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const router = useRouter();
  const { play } = useSound();
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState("");
  const [rows, setRows] = useState<LeaderboardItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(
          `${API_BASE}/api/assignment/${assignmentId}/leaderboard`,
        );
        const data = (await res.json()) as LeaderboardResponse;

        if (!data.ok) {
          if (!cancelled) setErr("Leaderboard yüklenemedi.");
          return;
        }

        if (!cancelled) {
          setQuizTitle(data.quizTitle);
          setRows(data.leaderboard);
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
  }, [assignmentId]);

  return (
    <main
      className="min-h-screen p-4 sm:p-6"
      style={{
        background:
          "linear-gradient(160deg, #0F0F23 0%, #14082e 55%, #0F0F23 100%)",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white shadow-xl backdrop-blur sm:p-7"
        >
          <div className="mb-6 text-center">
            <div className="text-5xl">🏆</div>
            <h1 className="mt-3 text-3xl font-bold">Leaderboard</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {quizTitle || "Mentis Quiz"}
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-zinc-300">Yükleniyor...</div>
          ) : err ? (
            <div className="py-10 text-center">
              <div className="text-4xl">⚠️</div>
              <p className="mt-3 text-zinc-300">{err}</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-zinc-300">
              Henüz skor bulunmuyor.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row, index) => {
                const medal =
                  index === 0
                    ? "🥇"
                    : index === 1
                      ? "🥈"
                      : index === 2
                        ? "🥉"
                        : "•";

                return (
                  <motion.div
                    key={row.attemptId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="flex w-12 shrink-0 items-center justify-center text-xl">
                      {medal}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          #{row.rank}
                        </span>
                        <span className="truncate text-zinc-100">
                          {row.name}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400">
                        {row.status === "FINISHED"
                          ? "Tamamlandı"
                          : "Devam ediyor"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white tabular-nums">
                        {row.score.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-xs text-zinc-400">puan</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button asChild>
              <Link
                href="/"
                onClick={() => {
                  play("click");
                }}
              >
                Yeni giriş
              </Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                play("click");
                router.back();
              }}
            >
              Geri dön
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
