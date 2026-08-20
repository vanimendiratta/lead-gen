"use client";

import { motion } from "framer-motion";
import { Sparkles, Terminal, RefreshCw, ExternalLink, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClaudeThinking({ label = "Claude AI is executing local reasoning under your plan…" }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 sm:p-8 border border-amber-500/40 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left relative overflow-hidden shadow-2xl shadow-amber-950/20"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent animate-pulse pointer-events-none" />

      {/* Multi-ring AI thinking orb */}
      <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400 animate-spin-slow opacity-60" />
        <div className="absolute inset-2 rounded-full border border-orange-400 animate-ping opacity-30" />
        <div className="h-10 w-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 glow-yellow font-bold">
          <Cpu className="h-5 w-5 animate-pulse" />
        </div>
      </div>

      <div className="space-y-1 relative z-10 flex-1">
        <div className="font-bold text-base text-foreground tracking-tight">
          {label}
        </div>
        <p className="text-xs text-muted-foreground font-mono leading-relaxed">
          Executing local AI reasoning via Claude Code CLI. Takes ~20–50 seconds.
        </p>
      </div>
    </motion.div>
  );
}

export function ClaudeRequired({
  error,
  onRetry,
}: {
  error?: string;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-6 sm:p-8 border border-rose-500/40 bg-rose-500/5 space-y-6"
    >
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-1">
          <Terminal className="h-5 w-5" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <h3 className="font-bold text-base text-rose-300">Claude Code CLI Required</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This phase requires the local <strong className="text-foreground">Claude Code CLI</strong> installed and authenticated on your machine.
          </p>

          {error && (
            <div className="rounded-xl bg-background/60 border border-rose-500/30 p-3 text-xs font-mono text-rose-300 overflow-x-auto">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-background/80 border border-border p-4 space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Quick Setup Steps:</div>
        <ol className="text-xs space-y-2 text-muted-foreground list-decimal list-inside font-mono">
          <li>Install Claude Code: <code className="text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">npm i -g @anthropic-ai/claude-code</code></li>
          <li>Run <code className="text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">claude</code> once in a terminal to authenticate.</li>
          <li>Click <strong className="text-foreground">Retry Connection</strong> below.</li>
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold h-10 px-5">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => window.open("https://claude.com/claude-code", "_blank")}
          className="h-10 px-4 font-mono text-xs"
        >
          <ExternalLink className="h-4 w-4 mr-2" /> Claude Code Documentation
        </Button>
      </div>
    </motion.div>
  );
}
