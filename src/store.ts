import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

export interface AdhdState {
  on: boolean;
  subway: boolean;
  miku: boolean;
  popit: boolean;
  butter: boolean;
}

export const adhdDefaults: AdhdState = {
  on: false,
  subway: true,
  miku: true,
  popit: true,
  butter: true,
};

export function levelInfo(xp: number): { lvl: number; into: number } {
  // уровни: 0→1, 50→2, 150→3, 300→4, 500→5, 750→6, 1050→7, ...
  const lvl = Math.floor(Math.sqrt(xp / 50)) + 1;
  const cur = 50 * (lvl - 1) ** 2;
  const need = 50 * lvl ** 2;
  return { lvl, into: (xp - cur) / (need - cur) };
}

interface Store {
  xp: number;
  theme: Theme;
  haptics: boolean;
  adhd: AdhdState;
  done: Record<string, boolean>; // moduleId -> пройден
  achievements: string[];
  quizBest: Record<string, number>; // quizId -> лучший %
  setTheme: (t: Theme) => void;
  setHaptics: (v: boolean) => void;
  setAdhd: (patch: Partial<AdhdState>) => void;
  addXp: (n: number) => void;
  completeModule: (id: string) => void;
  unlock: (id: string) => void;
  recordQuiz: (id: string, pct: number) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      xp: 0,
      theme: "light",
      haptics: true,
      adhd: adhdDefaults,
      done: {},
      achievements: [],
      quizBest: {},
      setTheme: (t) => {
        document.documentElement.dataset.theme = t;
        set({ theme: t });
      },
      setHaptics: (v) => set({ haptics: v }),
      setAdhd: (patch) => set((s) => ({ adhd: { ...s.adhd, ...patch } })),
      addXp: (n) => set((s) => ({ xp: s.xp + n })),
      completeModule: (id) =>
        set((s) => ({
          done: { ...s.done, [id]: true },
        })),
      unlock: (id) =>
        set((s) =>
          s.achievements.includes(id)
            ? s
            : {
                achievements: [...s.achievements, id],
              },
        ),
      recordQuiz: (id, pct) =>
        set((s) => ({
          quizBest: {
            ...s.quizBest,
            [id]: Math.max(pct, s.quizBest[id] ?? 0),
          },
        })),
    }),
    {
      name: "ved-lecture",
    },
  ),
);
