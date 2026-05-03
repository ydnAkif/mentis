"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/api";
import { useSound } from "@/components/sound-provider";

type QuestionDTO = {
  id: string;
  text: string;
  imageUrl: string | null;
  a: string;
  b: string;
  c: string;
  d: string;
  timeLimitSec: number;
};

type ExistingAnswerDTO = {
  questionId: string;
  selected: string;
  isCorrect: boolean;
  scoreAwarded: number;
  timeMs: number;
};

type QuizResponse =
  | {
      ok: true;
      attempt: {
        id: string;
        status: string;
        totalScore: number;
        answers: ExistingAnswerDTO[];
        assignment: {
          id: string;
          quiz: {
            id: string;
            title: string;
            questions: Array<{
              order: number;
              question: QuestionDTO;
            }>;
          };
        };
      };
    }
  | { ok: false; error: string };

type AnswerResponse =
  | {
      ok: true;
      isCorrect: boolean;
      correctOption: string;
      scoreAwarded: number;
    }
  | { ok: false; error: string };

type Phase = "loading" | "playing" | "feedback" | "timeout";

const OPTS: Record<
  string,
  { bg: string; border: string; shadow: string; darkText: boolean }
> = {
  A: {
    bg: "#6B2BFF",
    border: "#8050FF",
    shadow: "rgba(107,43,255,0.45)",
    darkText: false,
  },
  B: {
    bg: "#1E90FF",
    border: "#45A8FF",
    shadow: "rgba(30,144,255,0.45)",
    darkText: false,
  },
  C: {
    bg: "#00D084",
    border: "#2DEBA0",
    shadow: "rgba(0,208,132,0.45)",
    darkText: false,
  },
  D: {
    bg: "#FFD000",
    border: "#FFE040",
    shadow: "rgba(255,208,0,0.45)",
    darkText: true,
  },
};

function CircularTimer({
  timeLeft,
  total,
}: {
  timeLeft: number;
  total: number;
}) {
  const radius = 30;
  const strokeWidth = 4;
  const size = (radius + strokeWidth + 2) * 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, timeLeft / Math.max(total, 1));
  const dashOffset = circumference * (1 - pct);
  const color = pct > 0.5 ? "#00D084" : pct > 0.2 ? "#FFD000" : "#FF1744";
  const pulse = timeLeft > 0 && timeLeft <= 5;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={pulse ? { scale: [1, 1.13, 1] } : { scale: 1 }}
      transition={
        pulse ? { duration: 0.65, repeat: Infinity, ease: "easeInOut" } : {}
      }
    >
      <svg
        width={size}
        height={size}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: "rotate(-90deg)",
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.9s linear, stroke 0.3s ease",
          }}
        />
      </svg>
      <span
        className="relative z-10 font-bold tabular-nums select-none"
        style={{ color, fontSize: timeLeft >= 10 ? "0.9rem" : "1rem" }}
      >
        {timeLeft}
      </span>
    </motion.div>
  );
}

function AnswerBtn({
  optKey,
  text,
  selected,
  correctOption,
  phase,
  onClick,
  delay,
}: {
  optKey: string;
  text: string;
  selected: string | null;
  correctOption: string | null;
  phase: Phase;
  onClick: () => void;
  delay: number;
}) {
  const s = OPTS[optKey];
  const isFeedback = phase === "feedback" || phase === "timeout";
  const isSelected = selected === optKey;
  const isRight = correctOption === optKey;
  const disabled = !!selected || phase !== "playing";

  let bg = s.bg;
  let shadow = `0 6px 20px ${s.shadow}`;
  let opacity = 1;

  if (isFeedback) {
    if (isRight) {
      bg = "#00D084";
      shadow = "0 8px 28px rgba(0,208,132,0.6)";
    } else if (isSelected) {
      bg = "#FF1744";
      shadow = "0 8px 28px rgba(255,23,68,0.6)";
    } else {
      opacity = 0.28;
    }
  }

  const textColor = s.darkText ? "#1A1A2E" : "#ffffff";

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 220, damping: 18 }}
      whileHover={
        !disabled ? { scale: 1.03, boxShadow: `0 12px 28px ${s.shadow}` } : {}
      }
      whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={onClick}
      disabled={disabled}
      className="w-full cursor-pointer rounded-2xl border-2 p-4 text-left text-[15px] font-semibold transition-colors duration-300 focus:outline-none disabled:cursor-default"
      style={{
        backgroundColor: bg,
        boxShadow: shadow,
        borderColor: s.border,
        color: textColor,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: "rgba(0,0,0,0.22)", color: textColor }}
        >
          {optKey}
        </span>

        <span className="flex-1 leading-snug">{text}</span>

        <AnimatePresence>
          {isFeedback && isRight && (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -120 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-xl shrink-0"
            >
              ✅
            </motion.span>
          )}
          {isFeedback && isSelected && !isRight && (
            <motion.span
              key="x"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-xl shrink-0"
            >
              ❌
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

function ScorePop({ score }: { score: number }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.8 }}
      animate={{ opacity: 0, y: -72, scale: 1.1 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
      className="pointer-events-none absolute -top-2 right-4 z-50 text-2xl font-bold"
      style={{
        color: "#00D084",
        textShadow: "0 0 20px rgba(0,208,132,0.8)",
      }}
    >
      +{score.toLocaleString("tr-TR")}
    </motion.div>
  );
}

export default function PlayPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();
  const { play } = useSound();

  const [quizTitle, setQuizTitle] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [questionKey, setQuestionKey] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [correctOption, setCorrectOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [showScorePop, setShowScorePop] = useState(false);

  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const questionsRef = useRef<QuestionDTO[]>([]);
  const currentIdxRef = useRef(0);
  const questionStartRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittingRef = useRef(false);
  const countdownSoundRef = useRef<number | null>(null);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    currentIdxRef.current = currentIdx;
  }, [currentIdx]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const routeToResults = useCallback(() => {
    router.replace(`/results/${attemptId}`);
  }, [attemptId, router]);

  const resetFeedbackState = useCallback(() => {
    setSelected(null);
    setCorrectOption(null);
    setIsCorrect(null);
    setLastScore(0);
    setShowScorePop(false);
    countdownSoundRef.current = null;
  }, []);

  const advanceQuestion = useCallback(async () => {
    clearTimers();
    submittingRef.current = false;

    const nextIdx = currentIdxRef.current + 1;

    if (nextIdx >= questionsRef.current.length) {
      try {
        await fetch(`${API_BASE}/api/attempt/${attemptId}/finish`, {
          method: "POST",
        });
      } catch {
        // sonucu sayfada çekerken tekrar okuyacağız
      }

      routeToResults();
      return;
    }

    resetFeedbackState();
    setCurrentIdx(nextIdx);
    setQuestionKey((key) => key + 1);
    setPhase("playing");
  }, [attemptId, clearTimers, resetFeedbackState, routeToResults]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setErr(null);
      setPhase("loading");

      try {
        const res = await fetch(`${API_BASE}/api/attempt/${attemptId}/quiz`);
        const data = (await res.json()) as QuizResponse;

        if (!data.ok) {
          if (!cancelled) setErr("Quiz yüklenemedi.");
          return;
        }

        if (data.attempt.status === "FINISHED") {
          routeToResults();
          return;
        }

        const qs = data.attempt.assignment.quiz.questions
          .sort((a, b) => a.order - b.order)
          .map((item) => item.question);

        const existingAnswers = data.attempt.answers ?? [];
        const answeredCount = existingAnswers.length;

        if (!qs.length) {
          if (!cancelled) setErr("Bu quiz için soru bulunamadı.");
          return;
        }

        if (!cancelled) {
          setQuizTitle(data.attempt.assignment.quiz.title);
          setAssignmentId(data.attempt.assignment.id);
          setQuestions(qs);
          setTotalScore(data.attempt.totalScore ?? 0);
          resetFeedbackState();
        }

        if (answeredCount >= qs.length) {
          try {
            await fetch(`${API_BASE}/api/attempt/${attemptId}/finish`, {
              method: "POST",
            });
          } catch {
            // deneme zaten bitmiş olabilir
          }

          routeToResults();
          return;
        }

        if (!cancelled) {
          setCurrentIdx(answeredCount);
          setQuestionKey((key) => key + 1);
          setPhase("playing");
        }
      } catch {
        if (!cancelled) setErr("Sunucuya bağlanılamadı.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attemptId, resetFeedbackState, routeToResults]);

  useEffect(() => {
    const currentQuestion = questionsRef.current[currentIdxRef.current];
    if (!currentQuestion || phase !== "playing") return;

    clearTimers();
    countdownSoundRef.current = null;
    setTimeLeft(currentQuestion.timeLimitSec);
    questionStartRef.current = Date.now();

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          timerRef.current = null;
          setPhase("timeout");
          feedbackTimerRef.current = setTimeout(() => {
            void advanceQuestion();
          }, 2500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = intervalId;

    return () => clearInterval(intervalId);
  }, [advanceQuestion, clearTimers, phase, questionKey]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0 || timeLeft > 5) return;
    if (countdownSoundRef.current === timeLeft) return;

    countdownSoundRef.current = timeLeft;
    play("countdown");
  }, [phase, play, timeLeft]);

  const submitAnswer = useCallback(
    async (key: string) => {
      if (submittingRef.current || phase !== "playing") return;

      const currentQuestion = questionsRef.current[currentIdxRef.current];
      if (!currentQuestion) return;

      submittingRef.current = true;
      clearTimers();
      countdownSoundRef.current = null;
      setSelected(key);

      const timeMs = Date.now() - questionStartRef.current;

      try {
        const res = await fetch(`${API_BASE}/api/attempt/${attemptId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            selected: key,
            timeMs,
          }),
        });

        const data = (await res.json()) as AnswerResponse;

        if (!data.ok) {
          if (data.error === "ATTEMPT_ALREADY_FINISHED") {
            routeToResults();
            return;
          }

          setIsCorrect(false);
          setCorrectOption(null);
          play("wrong");
        } else {
          setIsCorrect(data.isCorrect);
          setCorrectOption(data.correctOption);
          setTotalScore((score) => score + (data.scoreAwarded ?? 0));

          if (data.isCorrect) {
            setLastScore(data.scoreAwarded ?? 0);
            setShowScorePop(true);
            setTimeout(() => setShowScorePop(false), 1600);
            play("correct");
          } else {
            play("wrong");
          }
        }
      } catch {
        setIsCorrect(false);
        setCorrectOption(null);
        play("wrong");
      }

      setPhase("feedback");
      feedbackTimerRef.current = setTimeout(() => {
        void advanceQuestion();
      }, 2500);
    },
    [advanceQuestion, attemptId, clearTimers, phase, play, routeToResults],
  );

  const currentQuestion = questions[currentIdx] ?? null;
  const progressPct =
    questions.length > 0 ? (currentIdx / questions.length) * 100 : 0;

  if (err) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "#0F0F23" }}
      >
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white shadow-xl backdrop-blur">
          <div className="text-5xl">⚠️</div>
          <h1 className="mt-4 text-2xl font-bold">Quiz açılamadı</h1>
          <p className="mt-2 text-sm text-zinc-400">{err}</p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button asChild>
              <Link href="/">Ana Sayfa</Link>
            </Button>
            {assignmentId && (
              <Button asChild variant="secondary">
                <Link href={`/leaderboard/${assignmentId}`}>Leaderboard</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (phase === "loading") {
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
          Quiz yükleniyor...
        </motion.div>
      </main>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const choices = [
    { key: "A", text: currentQuestion.a },
    { key: "B", text: currentQuestion.b },
    { key: "C", text: currentQuestion.c },
    { key: "D", text: currentQuestion.d },
  ] as const;

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #0F0F23 0%, #14082e 50%, #0F0F23 100%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 pt-4 pb-2">
        <div>
          <div
            className="rounded-xl border border-white/10 px-3 py-1.5 text-sm font-medium"
            style={{ background: "rgba(107,43,255,0.2)" }}
          >
            <span style={{ color: "rgba(140,80,255,0.9)" }}>●</span>{" "}
            <span className="font-bold tabular-nums text-white">
              {totalScore.toLocaleString("tr-TR")}
            </span>
            <span className="text-zinc-400"> puan</span>
          </div>
          <p className="mt-2 text-xs text-zinc-400">{quizTitle}</p>
        </div>

        <span className="text-sm text-zinc-400">
          <span className="font-semibold text-white">{currentIdx + 1}</span>/
          {questions.length}
        </span>

        <CircularTimer
          timeLeft={timeLeft}
          total={currentQuestion.timeLimitSec}
        />
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 pb-3">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #6B2BFF, #1E90FF)" }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="flex flex-1 flex-col gap-4"
          >
            <div
              className="rounded-2xl border border-white/10 p-5"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(10px)",
              }}
            >
              {currentQuestion.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentQuestion.imageUrl}
                  alt=""
                  className="mb-4 max-h-48 w-full rounded-xl object-cover"
                />
              )}
              <p className="text-lg font-semibold leading-relaxed text-white">
                {currentQuestion.text}
              </p>
            </div>

            <AnimatePresence>
              {phase === "timeout" && (
                <motion.div
                  key="timeout-banner"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-white"
                  style={{
                    background: "rgba(255,23,68,0.18)",
                    border: "1px solid rgba(255,23,68,0.35)",
                  }}
                >
                  ⏰ Süre doldu!
                </motion.div>
              )}

              {phase === "feedback" && isCorrect !== null && (
                <motion.div
                  key="feedback-banner"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl px-4 py-3 text-center text-sm font-semibold"
                  style={
                    isCorrect
                      ? {
                          background: "rgba(0,208,132,0.15)",
                          border: "1px solid rgba(0,208,132,0.35)",
                          color: "#00D084",
                        }
                      : {
                          background: "rgba(255,23,68,0.15)",
                          border: "1px solid rgba(255,23,68,0.35)",
                          color: "#FF6B6B",
                        }
                  }
                >
                  {isCorrect
                    ? `✅ Doğru! +${lastScore.toLocaleString("tr-TR")} puan`
                    : "❌ Yanlış cevap"}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
              {showScorePop && <ScorePop score={lastScore} />}

              {choices.map((choice, index) => (
                <AnswerBtn
                  key={choice.key}
                  optKey={choice.key}
                  text={choice.text}
                  selected={selected}
                  correctOption={correctOption}
                  phase={phase}
                  onClick={() => void submitAnswer(choice.key)}
                  delay={index * 0.07}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
