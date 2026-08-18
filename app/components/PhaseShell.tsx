"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PhaseShellProps {
  title: string;
  subtitle: string;
  onPrev?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  children: React.ReactNode;
}

export function PhaseShell({
  title,
  subtitle,
  onPrev,
  onNext,
  nextDisabled = false,
  nextLabel = "Next phase",
  children,
}: PhaseShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-12"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onPrev && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              className="h-9 px-3 text-xs font-mono border-border/80 hover:bg-secondary"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Previous
            </Button>
          )}

          {onNext && (
            <Button
              size="sm"
              onClick={onNext}
              disabled={nextDisabled}
              className="h-9 px-4 text-xs font-mono font-semibold bg-emerald-600 hover:bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-950/20"
            >
              {nextLabel} <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Phase Body */}
      <div>{children}</div>
    </motion.div>
  );
}
