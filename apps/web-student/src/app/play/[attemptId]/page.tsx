"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_BASE!;

type QuestionDTO = {
    id: string;
    text: string;
    imageUrl: string | null;
    a: string; b: string; c: string; d: string;
    timeLimitSec: number;
};

type AttemptQuizDTO = {
    id: string;
    status: string;
    assignment: {
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

type QuizResp =
    | { ok: true; attempt: AttemptQuizDTO }
    | { ok: false; error: string };



export default function PlayPage() {
    const { attemptId } = useParams<{ attemptId: string }>();
    const [data, setData] = useState<AttemptQuizDTO | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [result, setResult] = useState<"correct" | "wrong" | null>(null);

    useEffect(() => {
        (async () => {
            setErr(null);
            const res = await fetch(`${API}/api/attempt/${attemptId}/quiz`);
            const json = (await res.json()) as QuizResp;
            if (!json.ok) setErr("Quiz yüklenemedi.");
            else setData(json.attempt);
        })().catch(() => setErr("Sunucuya bağlanılamadı."));
    }, [attemptId]);

    const q = useMemo(() => {
        const first = data?.assignment?.quiz?.questions?.[0]?.question;
        return first ?? null;
    }, [data]);

    if (err) return <div className="p-6 text-zinc-50">{err}</div>;
    if (!q) return <div className="p-6 text-zinc-50">Yükleniyor...</div>;

    const choices = [
        { key: "A", text: q.a },
        { key: "B", text: q.b },
        { key: "C", text: q.c },
        { key: "D", text: q.d },
    ];

    function answer(k: string) {
        setSelected(k);
        // Şimdilik demo: doğru cevabı serverdan istemiyoruz (sonraki adımda submit endpoint’i yazacağız)
        // Bu ekranda sadece akış ve UI oturtuyoruz.
        setResult(k === "A" ? "correct" : "wrong");
    }
    if (!data) {
        return (
            <div className="flex items-center justify-center h-screen text-white">
                Yükleniyor…
            </div>
        );
    }

    return (
        <main className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-50">
            <div className="w-full max-w-2xl space-y-4">
                <Card className="bg-zinc-950/60 border-zinc-800 backdrop-blur text-zinc-50">
                    <CardHeader>
                        <CardTitle className="text-xl">{data.assignment.quiz.title}</CardTitle>
                        <div className="text-sm text-zinc-300">Soru 1</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-lg font-semibold">{q.text}</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {choices.map((c) => (
                                <Button
                                    key={c.key}
                                    onClick={() => answer(c.key)}
                                    disabled={!!selected}
                                    className="h-16 justify-start text-left whitespace-normal"
                                    variant={selected === c.key ? "secondary" : "default"}
                                >
                                    <span className="mr-3 font-bold">{c.key}</span>
                                    <span>{c.text}</span>
                                </Button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className={`rounded-xl p-3 border ${result === "correct"
                                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                                        : "border-red-500/40 bg-red-500/10 text-red-200"
                                        }`}
                                >
                                    {result === "correct" ? "Doğru! ✅" : "Yanlış. ❌"}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}