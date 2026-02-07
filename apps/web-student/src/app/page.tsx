"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LookupOk = { ok: true; student: { id: string; firstName: string; lastName: string } };
type LookupErr = { ok: false; error: string };

const API = process.env.NEXT_PUBLIC_API_BASE!;

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [loading, setLoading] = useState(false);

  const [student, setStudent] = useState<LookupOk["student"] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fullName = useMemo(
    () => (student ? `${student.firstName} ${student.lastName}` : ""),
    [student]
  );
  const router = useRouter();

  async function lookup() {
    setErr(null);
    setStudent(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/student/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode: joinCode.trim().toUpperCase(),
          studentNo: studentNo.trim(),
        }),
      });
      const data = (await res.json()) as LookupOk | LookupErr;
      if (!data.ok) setErr("Kayıt bulunamadı.");
      else setStudent(data.student);
    } catch {
      setErr("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    if (!student) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API}/api/attempt/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: joinCode.trim().toUpperCase(), studentId: student.id }),
      });
      const data = await res.json();
      router.push(`/play/${data.attemptId}`);
    } catch {
      setErr("Başlatılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-50">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Card className="bg-zinc-950/60 border-zinc-800 backdrop-blur text-zinc-50">
            <CardHeader>
              <CardTitle className="text-2xl tracking-tight text-zinc-50">MENTIS</CardTitle>
              <p className="text-sm text-zinc-300">Kod ve okul numaran ile giriş yap.</p>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Atama Kodu</label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Örn: NAMFZT"
                  className="bg-zinc-900/60 border-zinc-800 text-zinc-50 placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Okul Numarası</label>
                <Input
                  value={studentNo}
                  onChange={(e) => setStudentNo(e.target.value.replace(/\D/g, ""))}
                  placeholder="Örn: 123"
                  className="bg-zinc-900/60 border-zinc-800 text-zinc-50 placeholder:text-zinc-500"
                />
              </div>

              <Button
                onClick={lookup}
                disabled={loading || joinCode.trim().length < 4 || studentNo.trim().length < 1}
                className="w-full"
              >
                {loading ? "Kontrol ediliyor..." : "Devam"}
              </Button>

              <AnimatePresence>
                {err && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="text-sm text-red-300"
                  >
                    {err}
                  </motion.div>
                )}

                {student && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="mt-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
                  >
                    <div className="text-sm text-zinc-300">Hoş geldin</div>
                    <div className="text-lg font-semibold">{fullName}</div>

                    <div className="mt-3 flex gap-2">
                      <Button variant="secondary" className="flex-1" onClick={() => setStudent(null)} disabled={loading}>
                        Yanlış
                      </Button>
                      <Button className="flex-1" onClick={confirm} disabled={loading}>
                        Ben buyum
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <p className="mt-4 text-center text-xs text-zinc-400">
          Kişisel veri minimizasyonu: giriş için sadece okul numarası kullanılır.
        </p>
      </div>
    </main>
  );
}