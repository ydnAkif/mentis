"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

type SoundName = "click" | "correct" | "wrong" | "countdown" | "finish";

type SoundContextValue = {
  muted: boolean;
  setMuted: (value: boolean) => void;
  toggleMuted: () => void;
  play: (name: SoundName) => void;
};

const STORAGE_KEY = "mentis:sound-muted";
const SoundContext = createContext<SoundContextValue | null>(null);

type Tone = {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  delay?: number;
};

function scheduleTone(ctx: AudioContext, tone: Tone) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const startAt = ctx.currentTime + (tone.delay ?? 0);
  const endAt = startAt + tone.duration;

  oscillator.type = tone.type ?? "sine";
  oscillator.frequency.setValueAtTime(tone.frequency, startAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(tone.volume ?? 0.08, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.02);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMutedState] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  const ensureContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!ctxRef.current) {
      const AudioContextCtor =
        window.AudioContext ||
        ((
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext ??
          null);

      if (!AudioContextCtor) return null;
      ctxRef.current = new AudioContextCtor();
    }

    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }

    return ctxRef.current;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const unlock = () => {
      const ctx = ensureContext();
      if (ctx?.state === "suspended") {
        void ctx.resume();
      }
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [ensureContext]);

  const play = useCallback(
    (name: SoundName) => {
      if (muted) return;
      const ctx = ensureContext();
      if (!ctx) return;

      switch (name) {
        case "click":
          scheduleTone(ctx, {
            frequency: 660,
            duration: 0.08,
            type: "triangle",
            volume: 0.04,
          });
          break;
        case "correct":
          scheduleTone(ctx, {
            frequency: 520,
            duration: 0.12,
            type: "triangle",
            volume: 0.07,
          });
          scheduleTone(ctx, {
            frequency: 760,
            duration: 0.18,
            type: "triangle",
            volume: 0.08,
            delay: 0.11,
          });
          break;
        case "wrong":
          scheduleTone(ctx, {
            frequency: 240,
            duration: 0.14,
            type: "sawtooth",
            volume: 0.055,
          });
          scheduleTone(ctx, {
            frequency: 180,
            duration: 0.18,
            type: "sawtooth",
            volume: 0.05,
            delay: 0.1,
          });
          break;
        case "countdown":
          scheduleTone(ctx, {
            frequency: 880,
            duration: 0.06,
            type: "square",
            volume: 0.035,
          });
          break;
        case "finish":
          scheduleTone(ctx, {
            frequency: 523.25,
            duration: 0.12,
            type: "triangle",
            volume: 0.06,
          });
          scheduleTone(ctx, {
            frequency: 659.25,
            duration: 0.12,
            type: "triangle",
            volume: 0.06,
            delay: 0.1,
          });
          scheduleTone(ctx, {
            frequency: 783.99,
            duration: 0.16,
            type: "triangle",
            volume: 0.065,
            delay: 0.2,
          });
          scheduleTone(ctx, {
            frequency: 1046.5,
            duration: 0.22,
            type: "triangle",
            volume: 0.07,
            delay: 0.32,
          });
          break;
      }
    },
    [ensureContext, muted],
  );

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    }
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);

  const value = useMemo(
    () => ({ muted, setMuted, toggleMuted, play }),
    [muted, play, setMuted, toggleMuted],
  );

  return (
    <SoundContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100]">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={() => {
            if (muted) play("click");
            toggleMuted();
          }}
          className="rounded-full border border-white/10 bg-zinc-950/80 text-white shadow-lg backdrop-blur hover:bg-zinc-900/90"
          aria-label={muted ? "Sesleri aç" : "Sesleri kapat"}
          title={muted ? "Sesleri aç" : "Sesleri kapat"}
        >
          {muted ? <VolumeX /> : <Volume2 />}
        </Button>
      </div>
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used inside SoundProvider");
  }
  return context;
}
