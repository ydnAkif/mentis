"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

/* ─────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────── */
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

type Phase = "loading" | "playing" | "feedback" | "timeout" | "finished";

/* ─────────────────────────────────────────────────────
   Design constants — one colour per answer option
───────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────
   Sub-component: Circular SVG countdown timer
───────────────────────────────────────────────────── */
function CircularTimer({
  timeLeft,
  total,
}: {
  timeLeft: number;
  total: number;
}) {
  const R = 30;
  const SW = 4;
  const SIZE = (R + SW + 2) * 2;
  const CIRC = 2 * Math.PI * R;
  const pct = Math.max(0, timeLeft / Math.max(total, 1));
  const dashOffset = CIRC * (1 - pct);
  const color = pct > 0.5 ? "#00D084" : pct > 0.2 ? "#FFD000" : "#FF1744";
  const pulse = timeLeft > 0 && timeLeft <= 5;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
      animate={pulse ? { scale: [1, 1.13, 1] } : { scale: 1 }}
      transition={
        pulse ? { duration: 0.65, repeat: Infinity, ease: "easeInOut" } : {}
      }
    >
      <svg
        width={SIZE}
        height={SIZE}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: "rotate(-90deg)",
        }}
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={SW}
          fill="none"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={color}
          strokeWidth={SW}
          fill="none"
          strokeDasharray={CIRC}
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

/* ─────────────────────────────────────────────────────
   Sub-component: Answer button (A / B / C / D)
───────────────────────────────────────────────────── */
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
  const isMe = selected === optKey;
  const isRight = correctOption === optKey;
  const disabled = !!selected || phase !== "playing";

  let bg = s.bg;
  let shadow = `0 6px 20px ${s.shadow}`;
  let opacity = 1;

  if (isFeedback) {
    if (isRight) {
      bg = "#00D084";
      shadow = "0 8px 28px rgba(0,208,132,0.6)";
    } else if (isMe) {
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
      className="w-full text-left rounded-2xl p-4 flex items-center gap-3 font-semibold text-[15px] transition-colors duration-300 focus:outline-none disabled:cursor-default cursor-pointer"
      style={{
        backgroundColor: bg,
        boxShadow: shadow,
        border: `2px solid ${s.border}`,
        color: textColor,
      }}
    >
      {/* Option letter badge */}
      <span
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
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
        {isFeedback && isMe && !isRight && (
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
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────
   Sub-component: Floating "+score" animation
───────────────────────────────────────────────────── */
function ScorePop({ score }: { score: number }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.8 }}
      animate={{ opacity: 0, y: -72, scale: 1.1 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
      className="absolute -top-2 right-4 pointer-events-none z-50 font-bold text-2xl"
      style={{
        color: "#00D084",
        textShadow: "0 0 20px rgba(0,208,132,0.8)",
      }}
    >
      +{score.toLocaleString("tr-TR")}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   Sub-component: Results / completion screen
───────────────────────────────────────────────────── */
function ResultsScreen({
  quizTitle,
  totalScore,
  correctCount,
  total,
}: {
  quizTitle: string;
  totalScore: number;
  correctCount: number;
  total: number;
}) {
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #0F0F23 0%, #1a0933 50%, #0F0F23 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 15 }}
        className="w-full max-w-md text-center space-y-6"
      >
        {/* Party emoji */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-7xl"
        >
          🎉
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Tebrikler!</h1>
          <p className="text-zinc-400 text-sm">{quizTitle}</p>
        </div>

        {/* Total score */}
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
            transition={{ delay: 0.35 }}
          >
            {totalScore.toLocaleString("tr-TR")}
          </motion.p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4 border border-white/10"
            style={{ background: "rgba(0,208,132,0.1)" }}
          >
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: "#00D084" }}
            >
              {correctCount}/{total}
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
      </motion.div>
    </main>
  );
}

/* ─────────────────────────────────────────────────────
   Main page component
───────────────────────────────────────────────────── */
export default function PlayPage() {
  const { attemptId } = useParams<{ attemptId: string }>();

  /* ── Data ─────────────────── */
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);

  // Refs for stale-closure-safe access inside callbacks / timers
  const questionsRef = useRef<QuestionDTO[]>([]);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  /* ── Flow ─────────────────── */
  const [phase, setPhase] = useState<Phase>("loading");
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentIdxRef = useRef(0);
  useEffect(() => {
    currentIdxRef.current = currentIdx;
  }, [currentIdx]);

  // Incremented each time a new question starts → triggers timer useEffect
  const [questionKey, setQuestionKey] = useState(0);

  const [err, setErr] = useState<string | null>(null);

  /* ── Answer state ─────────── */
  const [selected, setSelected] = useState<string | null>(null);
  const [correctOption, setCorrectOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [showScorePop, setShowScorePop] = useState(false);
  const submittingRef = useRef(false); // prevents double-submit

  /* ── Score ────────────────── */
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  /* ── Timer ────────────────── */
  const [timeLeft, setTimeLeft] = useState(30);
  const questionStartRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ──────────────────────────────────────────────
     advanceQuestion — reads from refs so it's safe
     to call from setTimeout without stale closures
  ─────────────────────────────────────────────── */
  const advanceQuestion = useCallback(() => {
    // Clear any pending timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    submittingRef.current = false;

    const nextIdx = currentIdxRef.current + 1;

    if (nextIdx >= questionsRef.current.length) {
      // Last question done → finish attempt on backend
      fetch(`${API}/api/attempt/${attemptId}/finish`, {
        method: "POST",
      }).catch(() => {});
      setPhase("finished");
    } else {
      // Reset answer state for the next question
      setSelected(null);
      setCorrectOption(null);
      setIsCorrect(null);
      setLastScore(0);
      setShowScorePop(false);
      setCurrentIdx(nextIdx);
      setQuestionKey((k) => k + 1); // triggers timer useEffect
      setPhase("playing");
    }
  }, [attemptId]);

  /* ──────────────────────────────────────────────
     Load quiz data
  ─────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/attempt/${attemptId}/quiz`);
        const json = await res.json();
        if (!json.ok) {
          setErr("Quiz yüklenemedi.");
          return;
        }

        const qs: QuestionDTO[] = (
          json.attempt.assignment.quiz.questions as Array<{
            order: number;
            question: QuestionDTO;
          }>
        )
          .sort((a, b) => a.order - b.order)
          .map((q) => q.question);

        setQuizTitle(json.attempt.assignment.quiz.title);
        setQuestions(qs);
        setQuestionKey((k) => k + 1); // fire timer for question #0
        setPhase("playing");
      } catch {
        setErr("Sunucuya bağlanılamadı.");
      }
    })();
  }, [attemptId]);

  /* ──────────────────────────────────────────────
     Start/reset the countdown timer on each new question
     Depends on questionKey so it re-runs per question.
  ─────────────────────────────────────────────── */
  useEffect(() => {
    const q = questionsRef.current[currentIdxRef.current];
    if (!q || phase !== "playing") return;

    setTimeLeft(q.timeLimitSec);
    questionStartRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = id;
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionKey]);

  /* ──────────────────────────────────────────────
     Detect timer expiry → timeout phase
  ─────────────────────────────────────────────── */
  useEffect(() => {
    if (timeLeft !== 0 || phase !== "playing") return;
    setPhase("timeout");
    feedbackTimerRef.current = setTimeout(advanceQuestion, 2500);
  }, [timeLeft, phase, advanceQuestion]);

  /* ──────────────────────────────────────────────
     Submit an answer to the backend
  ─────────────────────────────────────────────── */
  const submitAnswer = useCallback(
    async (key: string) => {
      if (submittingRef.current || phase !== "playing") return;
      submittingRef.current = true;

      // Stop the countdown immediately
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const timeMs = Date.now() - questionStartRef.current;
      setSelected(key);

      const currentQ = questionsRef.current[currentIdxRef.current];

      try {
        const res = await fetch(`${API}/api/attempt/${attemptId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQ?.id ?? "",
            selected: key,
            timeMs,
          }),
        });
        const data = await res.json();

        if (data.ok) {
          setIsCorrect(data.isCorrect);
          setCorrectOption(data.correctOption);
          setTotalScore((s) => s + (data.scoreAwarded ?? 0));

          if (data.isCorrect) {
            setCorrectCount((c) => c + 1);
            setLastScore(data.scoreAwarded ?? 0);
            setShowScorePop(true);
            setTimeout(() => setShowScorePop(false), 1600);
          }
        } else {
          setIsCorrect(false);
          setCorrectOption(null);
        }
      } catch {
        setIsCorrect(false);
        setCorrectOption(null);
      }

      setPhase("feedback");
      feedbackTimerRef.current = setTimeout(advanceQuestion, 2500);
    },
    [phase, attemptId, advanceQuestion],
  );

  /* ──────────────────────────────────────────────
     Derived values
  ─────────────────────────────────────────────── */
  const currentQuestion = questions[currentIdx] ?? null;
  const progressPct =
    questions.length > 0 ? (currentIdx / questions.length) * 100 : 0;

  /* ──────────────────────────────────────────────
     Render: error
  ─────────────────────────────────────────────── */
  if (err) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0F0F23" }}
      >
        <div className="text-center text-white space-y-2">
          <div className="text-4xl">⚠️</div>
          <p className="text-lg">{err}</p>
        </div>
      </main>
    );
  }

  /* ──────────────────────────────────────────────
     Render: loading
  ─────────────────────────────────────────────── */
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
          Yükleniyor...
        </motion.div>
      </main>
    );
  }

  /* ──────────────────────────────────────────────
     Render: finished
  ─────────────────────────────────────────────── */
  if (phase === "finished") {
    return (
      <ResultsScreen
        quizTitle={quizTitle}
        totalScore={totalScore}
        correctCount={correctCount}
        total={questions.length}
      />
    );
  }

  if (!currentQuestion) return null;

  const choices = [
    { key: "A", text: currentQuestion.a },
    { key: "B", text: currentQuestion.b },
    { key: "C", text: currentQuestion.c },
    { key: "D", text: currentQuestion.d },
  ] as const;

  /* ──────────────────────────────────────────────
     Render: active quiz
  ─────────────────────────────────────────────── */
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #0F0F23 0%, #14082e 50%, #0F0F23 100%)",
      }}
    >
      {/* ── Header bar ─────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 max-w-2xl mx-auto w-full">
        {/* Score badge */}
        <div
          className="rounded-xl px-3 py-1.5 border border-white/10 text-sm font-medium"
          style={{ background: "rgba(107,43,255,0.2)" }}
        >
          <span style={{ color: "rgba(140,80,255,0.9)" }}>●</span>{" "}
          <span className="tabular-nums font-bold text-white">
            {totalScore.toLocaleString("tr-TR")}
          </span>
          <span className="text-zinc-400"> puan</span>
        </div>

        {/* Question number */}
        <span className="text-sm text-zinc-400">
          <span className="text-white font-semibold">{currentIdx + 1}</span>/
          {questions.length}
        </span>

        {/* Circular timer */}
        <CircularTimer
          timeLeft={timeLeft}
          total={currentQuestion.timeLimitSec}
        />
      </div>

      {/* ── Progress bar ───────────────────── */}
      <div className="px-4 pb-3 max-w-2xl mx-auto w-full">
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #6B2BFF, #1E90FF)",
            }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* ── Question + Answers ─────────────── */}
      <div className="flex-1 px-4 pb-6 max-w-2xl mx-auto w-full flex flex-col gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="flex flex-col gap-4 flex-1"
          >
            {/* Question text card */}
            <div
              className="rounded-2xl p-5 border border-white/10"
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
                  className="w-full max-h-48 object-cover rounded-xl mb-4"
                />
              )}
              <p className="text-white text-lg font-semibold leading-relaxed">
                {currentQuestion.text}
              </p>
            </div>

            {/* Status banners (timeout / feedback) */}
            <AnimatePresence>
              {phase === "timeout" && (
                <motion.div
                  key="timeout-banner"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl px-4 py-3 text-center font-semibold text-white text-sm"
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
                  className="rounded-xl px-4 py-3 text-center font-semibold text-sm"
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

            {/* Answer buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
              {showScorePop && <ScorePop score={lastScore} />}

              {choices.map((c, i) => (
                <AnswerBtn
                  key={c.key}
                  optKey={c.key}
                  text={c.text}
                  selected={selected}
                  correctOption={correctOption}
                  phase={phase}
                  onClick={() => submitAnswer(c.key)}
                  delay={i * 0.07}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
