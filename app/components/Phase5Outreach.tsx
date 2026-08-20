"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { ClaudeThinking, ClaudeRequired } from "./ClaudeStates";
import { MessageCircle, Mail, Camera, Copy, ExternalLink, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import type { RankedLead, OutreachChannel, OutreachLanguage, OutreachResult } from "@/lib/types";
import { callClaude } from "@/lib/claudeClient";
import { toast } from "sonner";

export function Phase5Outreach({
  selected,
  onPrev,
}: {
  selected: RankedLead | null;
  onPrev: () => void;
}) {
  const [channel, setChannel] = useState<OutreachChannel>("whatsapp");
  const [lang, setLang] = useState<OutreachLanguage>("hinglish");
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [bestSendTime, setBestSendTime] = useState("");
  const [generating, setGenerating] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);
  const [claudeError, setClaudeError] = useState<string | null>(null);
  const lastFor = useRef<string>("");

  // Clear drafts when lead / channel / language changes
  useEffect(() => {
    const key = `${selected?.id ?? ""}:${channel}:${lang}`;
    if (key !== lastFor.current) {
      setMessage("");
      setFollowUp("");
      setBestSendTime("");
    }
  }, [selected, channel, lang]);

  async function generate() {
    if (!selected) return;
    setGenerating(true);
    setNotInstalled(false);
    setClaudeError(null);
    const res = await callClaude<OutreachResult>("/api/outreach", {
      lead: selected,
      channel,
      language: lang,
    });
    setGenerating(false);
    if (!res.ok) {
      if (res.notInstalled) setNotInstalled(true);
      else setClaudeError(res.error);
      toast.error(res.notInstalled ? "Claude Code required" : "Draft failed");
      return;
    }
    lastFor.current = `${selected.id}:${channel}:${lang}`;
    setMessage(res.data.first);
    setFollowUp(res.data.followUp);
    setBestSendTime(res.data.bestSendTime);
    toast.success("Claude drafted your outreach");
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  function openChannel() {
    if (!selected) return;
    if (channel === "whatsapp" && selected.whatsapp) {
      const num = selected.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, "_blank");
    } else if (channel === "email" && selected.email) {
      const subject =
        lang === "hinglish"
          ? "Aapke business ke liye ek website demo banayi hai"
          : "Built a website demo for your business";
      window.open(
        `mailto:${selected.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
          message
        )}`,
        "_blank"
      );
    } else if (channel === "instagram") {
      window.open(`https://instagram.com/`, "_blank");
    } else {
      toast.error("No contact detail for this channel");
    }
  }

  if (!selected) {
    return (
      <PhaseShell
        title="Phase 5 — Cold Outreach Studio"
        subtitle="Claude writes personalized high-converting cold pitches and day-3 follow-ups."
        onPrev={onPrev}
      >
        <IncompleteState
          title="No target prospect selected yet"
          description="Outreach messages are generated specifically per lead using their audit findings. Run earlier phases and pick a prospect in Phase 3 first."
          prevPhaseLabel="3 (Rank)"
          onPrev={onPrev}
        />
      </PhaseShell>
    );
  }

  const channels: { id: OutreachChannel; label: string; icon: typeof MessageCircle; enabled: boolean }[] = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, enabled: !!selected.whatsapp },
    { id: "email", label: "Email", icon: Mail, enabled: !!selected.email },
    { id: "instagram", label: "Instagram DM", icon: Camera, enabled: true },
  ];

  const hasDrafts = !!message || !!followUp;

  return (
    <PhaseShell
      title="Phase 5 — Cold Outreach Studio"
      subtitle="Claude AI drafts personalized first-touch pitches and day-3 follow-ups tailored to business gaps in Hinglish or English."
      onPrev={onPrev}
    >
      {/* Target Recipient Header & Controls */}
      <div className="glass-card rounded-2xl p-5 border border-amber-500/30 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Sending Outreach To</div>
          <div className="font-display text-2xl font-bold text-foreground mt-0.5">{selected.name}</div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">
            {selected.phone} {selected.email ? `· ${selected.email}` : ""}
          </div>
        </div>

        <div className="flex items-center gap-4 bg-secondary/40 px-4 py-2 rounded-xl border border-border/60">
          <Label htmlFor="lang" className="text-xs font-mono text-muted-foreground">English</Label>
          <Switch
            id="lang"
            checked={lang === "hinglish"}
            onCheckedChange={(c) => setLang(c ? "hinglish" : "english")}
          />
          <Label htmlFor="lang" className="text-xs font-mono text-amber-400 font-semibold">Hinglish Mix</Label>
        </div>
      </div>

      {/* Channel Buttons & Generate Trigger */}
      <div className="glass-card rounded-2xl p-4 border border-amber-500/30 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {channels.map(({ id, label, icon: Icon, enabled }) => (
            <Button
              key={id}
              variant={channel === id ? "default" : "outline"}
              size="sm"
              disabled={!enabled}
              onClick={() => setChannel(id)}
              className={`h-9 px-4 text-xs font-mono ${
                channel === id
                  ? "bg-amber-500 text-amber-950 font-bold"
                  : "border-border/80 text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5 mr-2" /> {label}
            </Button>
          ))}
        </div>

        <Button
          onClick={generate}
          disabled={generating}
          className="h-10 px-5 bg-gradient-to-r from-amber-500 to-coral-600 hover:from-amber-400 hover:to-coral-500 text-amber-950 font-bold shadow-lg shadow-amber-950/20"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {generating ? "Claude is drafting…" : hasDrafts ? "Regenerate Outreach" : "Draft with Claude"}
        </Button>
      </div>

      {generating && <div className="mb-6"><ClaudeThinking label="Claude is crafting personalized outreach scripts for your target lead…" /></div>}
      {notInstalled && <div className="mb-6"><ClaudeRequired error={claudeError ?? undefined} onRetry={generate} /></div>}
      {claudeError && !notInstalled && (
        <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-mono text-rose-300">
          {claudeError}
        </div>
      )}

      {!hasDrafts && !generating && !notInstalled && (
        <Card className="glass-card border border-dashed border-border/80 rounded-2xl">
          <CardContent className="py-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="font-bold text-lg text-foreground">Select Channel & Language</div>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Click &ldquo;Draft with Claude&rdquo; above to generate a first-touch message and day-3 follow-up script.
            </p>
          </CardContent>
        </Card>
      )}

      {hasDrafts && !generating && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* First Touch Card */}
            <Card className="glass-card border border-border/60 rounded-2xl shadow-xl flex flex-col">
              <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-amber-400" />
                  First Touch Script
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(message)} className="h-8 text-xs font-mono border-border">
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                  <Button size="sm" onClick={openChannel} className="h-8 text-xs font-mono bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Send Direct
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="font-mono text-xs leading-relaxed bg-secondary/40 border-border/60 min-h-[300px] text-foreground rounded-xl"
                />
              </CardContent>
            </Card>

            {/* Follow-Up Card */}
            <Card className="glass-card border border-border/60 rounded-2xl shadow-xl flex flex-col">
              <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Day-3 Follow-Up Script
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => copy(followUp)} className="h-8 text-xs font-mono border-border">
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <Textarea
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  className="font-mono text-xs leading-relaxed bg-secondary/40 border-border/60 min-h-[300px] text-foreground rounded-xl"
                />
              </CardContent>
            </Card>
          </div>

          {bestSendTime && (
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
              <Clock className="h-4 w-4" />
              <span>Recommended Send Window: <strong>{bestSendTime}</strong></span>
            </div>
          )}

          {/* Pipeline Completion Banner */}
          <Card className="glass-card border border-cyan-500/40 bg-cyan-500/5 rounded-2xl p-6">
            <CardContent className="p-0 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-base text-foreground">Pipeline Complete</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You have completed scraping, auditing, ranking, site prompt generation, and outreach drafting for this client. Return to Phase 3 to select the next ranked prospect.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PhaseShell>
  );
}
