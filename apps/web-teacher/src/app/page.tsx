"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, LogIn, Sparkles } from "lucide-react";

export default function TeacherLogin() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? "/api/teacher/login" : "/api/teacher/register";
      // Assuming API is running on localhost:4000
      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }

      // Store token
      localStorage.setItem("mentis_teacher_token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 text-zinc-50 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0F0F23 0%, #1a103c 55%, #0F0F23 100%)",
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Mentis</span> Teacher
              </h1>
            </div>
          </div>

          <Card className="bg-zinc-950/60 border-zinc-800/60 backdrop-blur-xl shadow-2xl shadow-black/40">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight text-center text-zinc-100">
                {isLogin ? "Hoş Geldiniz" : "Hesap Oluşturun"}
              </CardTitle>
              <CardDescription className="text-center text-zinc-400">
                {isLogin
                  ? "E-posta ve şifrenizle giriş yapın"
                  : "Mentis'i kullanmaya başlamak için kayıt olun"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      type="email"
                      placeholder="ornek@okul.edu.tr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9 bg-zinc-900/50 border-zinc-800 focus-visible:ring-purple-500 text-zinc-100 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      type="password"
                      placeholder="Şifreniz"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-9 bg-zinc-900/50 border-zinc-800 focus-visible:ring-purple-500 text-zinc-100 h-11"
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={loading || !email || password.length < 6}
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Bekleniyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      <span>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</span>
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-zinc-400">
                {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  {isLogin ? "Kayıt Olun" : "Giriş Yapın"}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <p className="mt-8 text-center text-xs text-zinc-500">
          Mentis Öğretmen Paneli • Sürüm 1.0
        </p>
      </div>
    </main>
  );
}
