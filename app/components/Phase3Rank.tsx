"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { ClaudeThinking, ClaudeRequired } from "./ClaudeStates";
import { Crown, IndianRupee, MessageCircle, Phone, Mail, Sparkles, Check, Trophy } from "lucide-react";
import type { Lead, AuditResult, RankedLead } from "@/lib/types";
import { callClaude } from "@/lib/claudeClient";
import { toast } from "sonner";

export function Phase3Rank({
  leads,
  audits,
  ranked,
  setRanked,
  selectedId,
  setSelectedId,
  onNext,
  onPrev,
}: {
  leads: Lead[];
  audits: Record<string, AuditResult>;
  ranked: RankedLead[];
  setRanked: (r: RankedLead[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);
  const [claudeError, setClaudeError] = useState<string | null>(null);

  const auditedCount = leads.filter((l) => audits[l.id]).length;

  async function runRank() {
    setRunning(true);
    setNotInstalled(false);
    setClaudeError(null);
    const res = await callClaude<{ ranked: RankedLead[] }>("/api/rank", { leads, audits });
    setRunning(false);
    if (!res.ok) {
      if (res.notInstalled) setNotInstalled(true);
      else setClaudeError(res.error);
      toast.error(res.notInstalled ? "Claude Code required" : "Ranking failed");
      return;
    }
    setRanked(res.data.ranked);
    toast.success("Claude ranked your prospects");
  }

  // No audits yet → nothing to rank
  if (auditedCount === 0) {
    return (
      <PhaseShell
        title="Phase 3 — Rank & Qualify Prospects"
        subtitle="Claude scores each lead 0-100 on conversion potential, reachability, review demand, and revenue opportunity."
        onPrev={onPrev}
        onNext={onNext}
        nextDisabled
        nextLabel="Build website →"
      >
        <IncompleteState
          title={leads.length === 0 ? "No leads scraped yet" : "No audits yet"}
          description={
            leads.length === 0
              ? "Run Phases 1 and 2 first. Once leads are scraped and audited, Claude will rank them by conversion potential here."
              : "Run Phase 2 audit first. Then Claude ranks audited leads based on how likely they are to convert."
          }
          prevPhaseLabel={leads.length === 0 ? "1 (Discover)" : "2 (Audit)"}
          onPrev={onPrev}
        />
      </PhaseShell>
    );
  }

  return (
    <PhaseShell
      title="Phase 3 — Rank & Qualify Prospects"
      subtitle="Claude AI scores each audited lead on conversion intent and provides reasoning. Pick your target prospect to generate a site for."
      onPrev={onPrev}
      onNext={onNext}
      nextDisabled={!selectedId}
      nextLabel="Build website →"
    >
      {/* Top Action Bar */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-500/30 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs font-mono text-muted-foreground">
          {ranked.length > 0
            ? `${ranked.length} prospects scored and sorted by Claude`
            : `${auditedCount} audited lead${auditedCount === 1 ? "" : "s"} ready for ranking`}
        </div>

        <Button
          onClick={runRank}
          disabled={running}
          className="h-10 px-5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-indigo-950 font-bold shadow-lg shadow-indigo-950/20"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {running ? "Claude is ranking…" : ranked.length > 0 ? "Re-Rank with Claude" : "Rank Prospects with Claude"}
        </Button>
      </div>

      {running && <div className="mb-6"><ClaudeThinking label="Claude is scoring conversion potential for each prospect…" /></div>}
      {notInstalled && <div className="mb-6"><ClaudeRequired error={claudeError ?? undefined} onRetry={runRank} /></div>}
      {claudeError && !notInstalled && (
        <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-mono text-rose-300">
          {claudeError}
        </div>
      )}

      {ranked.length === 0 && !running && !notInstalled && (
        <Card className="glass-card border border-dashed border-border/80 rounded-2xl">
          <CardContent className="py-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="font-bold text-lg text-foreground">Ready for AI Qualification</div>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Click &ldquo;Rank Prospects with Claude&rdquo; above to run conversion scoring logic.
            </p>
          </CardContent>
        </Card>
      )}

      {ranked.length > 0 && (
        <>
          {/* Podium Grid (Top 3) */}
          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            {ranked.slice(0, 3).map((lead, i) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedId === lead.id}
                  aria-label={`Select rank ${i + 1}: ${lead.name}`}
                  onClick={() => setSelectedId(lead.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(lead.id);
                    }
                  }}
                  className={`glass-card h-full cursor-pointer transition-all duration-200 border rounded-2xl p-5 hover:-translate-y-1 ${
                    selectedId === lead.id
                      ? "border-indigo-500/70 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/30"
                      : "border-border/60 hover:border-border"
                  }`}
                >
                  <CardHeader className="p-0 pb-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className={`text-xs font-mono uppercase tracking-wider ${
                          i === 0
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : i === 1
                            ? "bg-slate-300/20 text-slate-200 border border-slate-400/40"
                            : "bg-amber-700/20 text-amber-400 border border-amber-700/40"
                        }`}
                      >
                        <Crown className="h-3 w-3 mr-1" /> Rank #{i + 1}
                      </Badge>
                      <div className="font-display text-3xl font-bold text-indigo-400 tabular-nums">
                        {lead.score}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 space-y-3">
                    <div>
                      <div className="font-bold text-base text-foreground leading-snug truncate">{lead.name}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{lead.address}</div>
                    </div>

                    {lead.scoreReasoning && (
                      <div className="rounded-xl bg-secondary/60 border border-border/60 p-3 text-xs text-muted-foreground italic leading-relaxed">
                        &ldquo;{lead.scoreReasoning}&rdquo;
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-border/50">
                      <span className="flex items-center text-amber-400">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {lead.audit.estLostRevenuePerMonth.toLocaleString("en-IN")}/mo lost
                      </span>
                      <span className="text-muted-foreground">{lead.reviewsCount} reviews</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-2">
                        {lead.phone && <Phone className="h-3.5 w-3.5 text-muted-foreground" />}
                        {lead.whatsapp && <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />}
                        {lead.email && <Mail className="h-3.5 w-3.5 text-indigo-400" />}
                      </div>

                      <Badge
                        variant={selectedId === lead.id ? "default" : "outline"}
                        className={`text-[10px] font-mono ${
                          selectedId === lead.id
                            ? "bg-indigo-500 text-indigo-950 font-bold"
                            : "text-muted-foreground border-border"
                        }`}
                      >
                        {selectedId === lead.id ? "Target Selected" : "Click to Target"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Full Ranked Table */}
          <Card className="glass-card border border-border/60 rounded-2xl shadow-xl">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-base font-bold">All Ranked Prospect Leads</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                      <TableHead className="w-12 font-mono text-xs">#</TableHead>
                      <TableHead className="text-xs">Business & Reason</TableHead>
                      <TableHead className="w-[220px] text-xs">Conversion Score</TableHead>
                      <TableHead className="text-xs">Est. Revenue Lost</TableHead>
                      <TableHead className="text-xs">Site Status</TableHead>
                      <TableHead className="text-right text-xs">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ranked.map((lead, i) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        aria-selected={selectedId === lead.id}
                        className={`border-b border-border/40 cursor-pointer transition-colors ${
                          selectedId === lead.id ? "bg-indigo-500/10" : "hover:bg-secondary/40"
                        }`}
                        onClick={() => setSelectedId(lead.id)}
                      >
                        <TableCell className="font-mono text-xs font-bold text-muted-foreground align-top pt-3.5">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm text-foreground">{lead.name}</div>
                          <div className="text-xs font-mono text-muted-foreground">
                            {lead.reviewsCount} reviews · {lead.rating}★
                          </div>
                          {lead.scoreReasoning && (
                            <div className="text-xs text-muted-foreground/80 italic mt-1 max-w-md">
                              {lead.scoreReasoning}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="align-top pt-4">
                          <div className="flex items-center gap-2">
                            <div className="relative h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${lead.score}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-400"
                              />
                            </div>
                            <span className="font-mono text-xs font-bold tabular-nums w-8 text-right text-indigo-400">
                              {lead.score}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono tabular-nums text-xs text-amber-400 align-top pt-3.5">
                          ₹{lead.audit.estLostRevenuePerMonth.toLocaleString("en-IN")}/mo
                        </TableCell>
                        <TableCell className="align-top pt-3.5">
                          {lead.audit.hasWebsite ? (
                            <Badge variant="secondary" className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                              {lead.audit.pageSpeedScore} PageSpeed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-mono text-rose-400 border-rose-500/30 bg-rose-500/10">
                              No Website
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right align-top pt-3">
                          <Button
                            size="sm"
                            variant={selectedId === lead.id ? "default" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(lead.id);
                            }}
                            className={`h-8 px-3 text-xs font-mono ${
                              selectedId === lead.id
                                ? "bg-indigo-500 text-indigo-950 font-bold"
                                : "border-border/80 text-muted-foreground"
                            }`}
                          >
                            {selectedId === lead.id ? (
                              <>
                                <Check className="h-3 w-3 mr-1" /> Selected
                              </>
                            ) : (
                              "Select Lead"
                            )}
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </PhaseShell>
  );
}
