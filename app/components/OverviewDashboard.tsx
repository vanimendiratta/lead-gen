"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  ShieldAlert,
  Trophy,
  Wand2,
  Send,
  ArrowRight,
  Sparkles,
  IndianRupee,
  Phone,
  Globe,
  Gauge,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import type { Lead, AuditResult, RankedLead } from "@/lib/types";

export interface OverviewDashboardProps {
  leads: Lead[];
  audits: Record<string, AuditResult>;
  ranked: RankedLead[];
  selectedId: string | null;
  completedPhases: Set<number>;
  onNavigatePhase: (phase: number) => void;
}

export function OverviewDashboard({
  leads,
  audits,
  ranked,
  selectedId,
  completedPhases,
  onNavigatePhase,
}: OverviewDashboardProps) {
  const auditedCount = Object.keys(audits).length;
  const totalLostRevenue = Object.values(audits).reduce(
    (sum, a) => sum + (a?.estLostRevenuePerMonth ?? 0),
    0
  );
  const selectedLead = ranked.find((r) => r.id === selectedId) ?? null;
  const topRanked = ranked[0] ?? null;

  const pipelineStages = [
    {
      phase: 1,
      name: "DISCOVER",
      title: "1. Lead Scraper",
      desc: "Extract local businesses from Google Maps with phone & coordinates.",
      icon: MapPin,
      accent: "text-[color:var(--phase-discover)]",
      badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      status: completedPhases.has(1) ? "complete" : "pending",
      countLabel: `${leads.length} Leads Scraped`,
    },
    {
      phase: 2,
      name: "ANALYZE",
      title: "2. Business Audit",
      desc: "Audit PageSpeed scores, mobile UX, schema & monthly lost revenue.",
      icon: ShieldAlert,
      accent: "text-[color:var(--phase-audit)]",
      badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      status: completedPhases.has(2) ? "complete" : leads.length > 0 ? "ready" : "pending",
      countLabel: `${auditedCount} Audited`,
    },
    {
      phase: 3,
      name: "PRIORITIZE",
      title: "3. Rank Prospects",
      desc: "Claude scores leads 0-100 based on reachability & conversion intent.",
      icon: Trophy,
      accent: "text-[color:var(--phase-rank)]",
      badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      status: completedPhases.has(3) ? "complete" : auditedCount > 0 ? "ready" : "pending",
      countLabel: `${ranked.length} Ranked`,
    },
    {
      phase: 4,
      name: "BUILD",
      title: "4. AI Site Builder",
      desc: "Generate battle-tested prompts for Lovable, Bolt, or Claude Code.",
      icon: Wand2,
      accent: "text-[color:var(--phase-build)]",
      badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      status: completedPhases.has(4) ? "complete" : ranked.length > 0 ? "ready" : "pending",
      countLabel: selectedLead ? "Target Selected" : "Awaiting Selection",
    },
    {
      phase: 5,
      name: "CONVERT",
      title: "5. Cold Outreach",
      desc: "Draft personalized WhatsApp, Email & IG pitch scripts in Hinglish.",
      icon: Send,
      accent: "text-[color:var(--phase-outreach)]",
      badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      status: completedPhases.has(5) ? "complete" : selectedId ? "ready" : "pending",
      countLabel: selectedLead ? "Ready to Draft" : "Pending Selection",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Cinematic Hero Mission Control Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-950/20"
      >
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <Zap className="h-3.5 w-3.5" />
              <span>AI Growth Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Your Pipeline, Powered by <span className="gradient-text-emerald">AI Intelligence.</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
              Discover local businesses, diagnose website gaps, rank high-intent opportunities,
              generate custom website prompts, and launch cold outreach — driven by your local Claude AI engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigatePhase(1)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-emerald-950 font-bold text-xs font-mono shadow-lg shadow-emerald-950/30 transition-all duration-200 active:scale-95 flex items-center gap-2"
            >
              <span>{leads.length === 0 ? "Launch Scraper Pipeline" : "Continue Pipeline"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Connected Intelligence Pipeline Bar */}
      <div className="glass-card rounded-2xl p-6 border border-border/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-foreground font-semibold">
              Growth Intelligence Workflow
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {completedPhases.size} of 5 Pipeline Stages Active
          </span>
        </div>

        {/* Nodes Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {pipelineStages.map((stage) => {
            const Icon = stage.icon;
            const isDone = stage.status === "complete";
            const isReady = stage.status === "ready";

            return (
              <div
                key={stage.phase}
                onClick={() => onNavigatePhase(stage.phase)}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 space-y-2 hover:-translate-y-0.5 ${
                  isDone
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : isReady
                    ? "bg-indigo-500/10 border-indigo-500/40"
                    : "bg-secondary/30 border-border/40 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground">
                    {stage.name}
                  </span>
                  <Icon className={`h-3.5 w-3.5 ${stage.accent}`} />
                </div>
                <div className="text-xs font-semibold truncate text-foreground">{stage.title}</div>
                <div className="text-[10px] font-mono text-muted-foreground truncate">{stage.countLabel}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-5 border border-border/60 hover:border-emerald-500/40 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Total Leads Scraped
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold tabular-nums">{leads.length}</div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <Phone className="h-3 w-3" /> {leads.filter((l) => l.phone).length} Phones
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-rose-400">
              <Globe className="h-3 w-3" /> {leads.filter((l) => !l.website).length} No Site
            </span>
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 border border-border/60 hover:border-cyan-500/40 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Audited Businesses
            </span>
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold tabular-nums flex items-baseline gap-2">
            {auditedCount}
            <span className="text-sm font-normal text-muted-foreground">/ {leads.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Gauge className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              Avg PageSpeed:{" "}
              <strong className="text-foreground">
                {auditedCount
                  ? Math.round(
                      Object.values(audits).reduce((s, a) => s + a.pageSpeedScore, 0) / auditedCount
                    )
                  : 0}
              </strong>
            </span>
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-5 border border-border/60 hover:border-amber-500/40 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Est. Lost ₹ / Month
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold tabular-nums text-amber-400 flex items-center">
            ₹{totalLostRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            Aggregate revenue opportunity
          </div>
        </motion.div>

        {/* Metric 4 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 border border-border/60 hover:border-indigo-500/40 transition-colors space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Top Ranked Prospect
            </span>
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          {topRanked ? (
            <div className="space-y-1">
              <div className="font-semibold text-sm truncate text-foreground">{topRanked.name}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Score: <strong className="text-emerald-400">{topRanked.score}/100</strong></span>
                <span>₹{topRanked.audit.estLostRevenuePerMonth.toLocaleString("en-IN")}/mo</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground font-mono">
              Run Phase 3 ranking to discover your top prospect.
            </div>
          )}
        </motion.div>
      </div>

      {/* Interactive 5-Phase Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Pipeline Stage Cards</h2>
          <span className="text-xs font-mono text-muted-foreground">Click to jump into any phase</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineStages.map((p, idx) => {
            const Icon = p.icon;
            const isDone = p.status === "complete";
            const isReady = p.status === "ready";

            return (
              <motion.div
                key={p.phase}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                onClick={() => onNavigatePhase(p.phase)}
                className={`glass-card rounded-2xl p-6 cursor-pointer border transition-all duration-200 group relative flex flex-col justify-between hover:-translate-y-1 ${
                  isDone
                    ? "border-emerald-500/40 hover:border-emerald-500/70"
                    : isReady
                    ? "border-indigo-500/40 hover:border-indigo-500/70"
                    : "border-border/50 opacity-80 hover:opacity-100 hover:border-border"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-400"
                          : isReady
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {isDone ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/30">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                      </span>
                    ) : isReady ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono border border-indigo-500/30">
                        <TrendingUp className="h-3.5 w-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-mono">
                        <Clock className="h-3.5 w-3.5" /> Pending
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">{p.countLabel}</span>
                  <span className="text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold">
                    Open Phase <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
