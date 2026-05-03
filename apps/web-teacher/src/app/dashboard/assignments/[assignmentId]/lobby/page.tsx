"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Play, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  // Mock data
  const joinCode = "NAMFZT";
  const students = [
    { id: "1", name: "Ahmet Y." },
    { id: "2", name: "Ayşe K." },
    { id: "3", name: "Mehmet S." },
    { id: "4", name: "Zeynep A." },
    { id: "5", name: "Ali V." },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    // Start the quiz logic
    alert("Quiz başlıyor!");
    // router.push(`/dashboard/assignments/${params.assignmentId}/live`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Lobi: Fen Bilimleri Quiz 1</h2>
          <p className="text-zinc-400 mt-1">Öğrencilerin katılmasını bekleyin.</p>
        </div>
        <Button 
          onClick={handleStart}
          size="lg" 
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/20"
        >
          <Play className="w-5 h-5 mr-2" fill="currentColor" />
          Sınavı Başlat
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
        {/* Join Info */}
        <Card className="col-span-1 bg-zinc-900/50 border-zinc-800 flex flex-col items-center justify-center text-center p-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-400 font-medium">Katılım Kodu</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-indigo-400">
              {joinCode}
            </div>
            <Button 
              onClick={handleCopy}
              variant="outline" 
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Kopyalandı" : "Kodu Kopyala"}
            </Button>
            
            <div className="mt-8 pt-8 border-t border-zinc-800 w-full">
              <div className="flex items-center justify-center gap-2 text-zinc-300 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-xl font-bold">{students.length}</span>
              </div>
              <p className="text-sm text-zinc-500">Öğrenci Katıldı</p>
            </div>
          </CardContent>
        </Card>

        {/* Connected Students List */}
        <Card className="col-span-1 md:col-span-2 bg-zinc-900/50 border-zinc-800 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/80">
            <CardTitle className="text-lg font-medium text-zinc-200">Bağlanan Öğrenciler</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-wrap gap-3">
              {students.map((student) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={student.id}
                  className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium rounded-full"
                >
                  {student.name}
                </motion.div>
              ))}
              
              {/* Waiting animation */}
              <div className="px-4 py-2 bg-zinc-800/50 border border-zinc-800 text-zinc-500 font-medium rounded-full flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </span>
                bekleniyor...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
