"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IncompleteState({
  title,
  description,
  prevPhaseLabel,
  onPrev,
}: {
  title: string;
  description: string;
  prevPhaseLabel: string;
  onPrev: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 border border-border/60"
    >
      <div className="h-14 w-14 rounded-2xl bg-secondary text-muted-foreground mx-auto flex items-center justify-center border border-border/80">
        <Layers className="h-7 w-7" strokeWidth={1.5} />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <Button onClick={onPrev} variant="default" className="h-11 px-6 font-medium">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Phase {prevPhaseLabel}
      </Button>
    </motion.div>
  );
}
