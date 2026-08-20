"use client";

import { motion } from "framer-motion";
import { Check, MapPin, ShieldAlert, Trophy, Wand2, Send } from "lucide-react";

export interface StepperProps {
  current: number;
  completed: Set<number>;
  onJump: (n: number) => void;
}

export function Stepper({ current, completed, onJump }: StepperProps) {
  const steps = [
    { n: 1, label: "1. Scrape", icon: MapPin },
    { n: 2, label: "2. Audit", icon: ShieldAlert },
    { n: 3, label: "3. Rank", icon: Trophy },
    { n: 4, label: "4. Build", icon: Wand2 },
    { n: 5, label: "5. Outreach", icon: Send },
  ];

  return (
    <nav aria-label="Pipeline progress" className="w-full">
      <ol className="flex items-center justify-between gap-2 overflow-x-auto py-1 no-scrollbar">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = current === step.n;
          const isDone = completed.has(step.n);

          return (
            <li key={step.n} className="flex-1 min-w-[120px]">
              <button
                onClick={() => onJump(step.n)}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all duration-200 border ${
                  isCurrent
                    ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-sm shadow-cyan-950/30"
                    : isDone
                    ? "bg-secondary/60 text-cyan-300/80 border-cyan-500/20 hover:bg-secondary hover:text-cyan-300"
                    : "bg-secondary/30 text-muted-foreground border-border/40 hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isCurrent
                      ? "bg-cyan-400 text-slate-950 font-bold"
                      : isDone
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-border/60 text-muted-foreground"
                  }`}
                >
                  {isDone && !isCurrent ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                </div>
                <span className="truncate font-medium">{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
