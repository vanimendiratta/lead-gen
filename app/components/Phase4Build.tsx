"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { ClaudeThinking, ClaudeRequired } from "./ClaudeStates";
import { Copy, ExternalLink, Sparkles, Check, Wand2, Monitor, Globe, Eye } from "lucide-react";
import type { RankedLead, BuildPromptResult } from "@/lib/types";
import { callClaude } from "@/lib/claudeClient";
import { toast } from "sonner";

const PLATFORMS = [
  { id: "lovable", label: "Lovable", url: "https://lovable.dev" },
  { id: "claude-code", label: "Claude Code", url: "https://claude.com/claude-code" },
  { id: "bolt", label: "Bolt.new", url: "https://bolt.new" },
  { id: "codex", label: "Codex / OpenAI", url: "https://chat.openai.com" },
];

export function Phase4Build({
  selected,
  onNext,
  onPrev,
}: {
  selected: RankedLead | null;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [platform, setPlatform] = useState("lovable");
  const [prompt, setPrompt] = useState("");
  const [pitchPoints, setPitchPoints] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);
  const [claudeError, setClaudeError] = useState<string | null>(null);
  const lastFor = useRef<string>("");

  // Clear prompt state when target lead or platform changes
  useEffect(() => {
    const key = `${selected?.id ?? ""}:${platform}`;
    if (key !== lastFor.current) {
      setPrompt("");
      setPitchPoints([]);
      setTyped("");
      setIsTyping(false);
    }
  }, [selected, platform]);

  // Typewriter stream for prompt output
  useEffect(() => {
    setTyped("");
    if (!prompt) {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    let i = 0;
    const id = setInterval(() => {
      i += 16;
      setTyped(prompt.slice(0, i));
      if (i >= prompt.length) {
        setIsTyping(false);
        clearInterval(id);
      }
    }, 8);
    return () => clearInterval(id);
  }, [prompt]);

  function revealFullPrompt() {
    setTyped(prompt);
    setIsTyping(false);
  }

  async function generate() {
    if (!selected) return;
    setGenerating(true);
    setNotInstalled(false);
    setClaudeError(null);
    const res = await callClaude<BuildPromptResult>("/api/build-prompt", { lead: selected, platform });
    setGenerating(false);
    if (!res.ok) {
      if (res.notInstalled) setNotInstalled(true);
      else setClaudeError(res.error);
      toast.error(res.notInstalled ? "Claude Code required" : "Generation failed");
      return;
    }
    lastFor.current = `${selected.id}:${platform}`;
    setPrompt(res.data.prompt);
    setPitchPoints(res.data.pitchPoints ?? []);
    toast.success("Claude generated your website prompt");
  }

  function copyPrompt() {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied. Paste into " + PLATFORMS.find((p) => p.id === platform)?.label);
  }

  function openPlatform() {
    const url = PLATFORMS.find((p) => p.id === platform)?.url;
    if (url) window.open(url, "_blank");
  }

  if (!selected) {
    return (
      <PhaseShell
        title="Phase 4 — AI Site Builder Studio"
        subtitle="Claude writes a complete, tailored website builder prompt for your selected target lead."
        onPrev={onPrev}
        onNext={onNext}
        nextDisabled
        nextLabel="Draft outreach →"
      >
        <IncompleteState
          title="No target prospect selected yet"
          description="Run scrape, audit, and rank, then pick a prospect in Phase 3. Claude will write a full website builder prompt (for Lovable / Bolt / Claude Code) here."
          prevPhaseLabel="3 (Rank)"
          onPrev={onPrev}
        />
      </PhaseShell>
    );
  }

  return (
    <PhaseShell
      title="Phase 4 — AI Site Builder Studio"
      subtitle="Claude AI writes a complete, conversion-focused prompt tailored for Lovable, Bolt, or Claude Code."
      onPrev={onPrev}
      onNext={onNext}
      nextLabel="Draft outreach →"
    >
      {/* Top Controls Bar */}
      <div className="glass-card rounded-2xl p-5 border border-blue-500/30 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Target Prospect</div>
          <div className="font-display text-2xl font-bold text-foreground mt-0.5">{selected.name}</div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">{selected.address}</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-[160px]">
            <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
              <SelectTrigger className="h-10 text-xs font-mono bg-secondary/60 border-border/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generate}
            disabled={generating}
            className="h-10 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-blue-950 font-bold shadow-lg shadow-blue-950/20"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {generating ? "Generating Prompt…" : prompt ? "Regenerate Prompt" : "Generate with Claude"}
          </Button>
        </div>
      </div>

      {notInstalled && <div className="mb-6"><ClaudeRequired error={claudeError ?? undefined} onRetry={generate} /></div>}
      {claudeError && !notInstalled && (
        <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-mono text-rose-300">
          {claudeError}
        </div>
      )}

      {/* Main Workspace (Prompt Left, Live Preview Right) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Generated AI Prompt */}
        <Card className="glass-card border border-border/60 rounded-2xl shadow-xl flex flex-col">
          <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Claude Builder Prompt
            </CardTitle>
            {prompt && (
              <div className="flex gap-2">
                {isTyping && (
                  <Button size="sm" variant="ghost" onClick={revealFullPrompt} className="h-8 text-xs font-mono text-blue-400">
                    <Eye className="h-3.5 w-3.5 mr-1" /> Show Full
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={openPlatform} className="h-8 text-xs font-mono border-border">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open {PLATFORMS.find((p) => p.id === platform)?.label}
                </Button>
                <Button size="sm" onClick={copyPrompt} className="h-8 text-xs font-mono bg-blue-500 hover:bg-blue-400 text-blue-950 font-bold">
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy Prompt
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col">
            {generating ? (
              <ClaudeThinking label="Claude is engineering the tailored builder prompt…" />
            ) : prompt ? (
              <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono bg-secondary/40 rounded-xl p-4 max-h-[500px] overflow-y-auto border border-border/60 text-muted-foreground flex-1 select-text">
                {typed}
                {isTyping && <span className="animate-pulse text-blue-400">▌</span>}
              </pre>
            ) : (
              <div className="h-[340px] flex flex-col items-center justify-center text-center gap-3 text-muted-foreground font-mono text-xs">
                <Wand2 className="h-8 w-8 text-muted-foreground/50" />
                <div className="max-w-xs">
                  Pick a target platform and click <span className="text-blue-400 font-semibold">&ldquo;Generate with Claude&rdquo;</span> to create a complete site builder prompt.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Live Browser Chrome Frame Website Preview */}
        <Card className="glass-card border border-border/60 rounded-2xl shadow-xl flex flex-col">
          <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-400" />
              Live Site Demo Preview
            </CardTitle>
            <span className="text-xs font-mono text-muted-foreground">Browser Sandbox</span>
          </CardHeader>
          <CardContent className="pt-4 flex-1 space-y-4">
            {/* Browser Chrome Window Container */}
            <div className="rounded-xl overflow-hidden border border-border/80 shadow-2xl bg-secondary/80 flex flex-col h-[380px]">
              <div className="h-8 bg-secondary border-b border-border/60 px-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>

                <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-background/60 text-[10px] font-mono text-muted-foreground border border-border/40 max-w-xs truncate">
                  <Globe className="h-2.5 w-2.5" />
                  <span>https://demo.{selected.id}.lead-launch.app</span>
                </div>

                <div className="w-10" />
              </div>

              <iframe title="Demo Website Preview" srcDoc={demoSiteHtml(selected)} className="w-full flex-1 bg-[#f5efe6]" />
            </div>

            {pitchPoints.length > 0 && (
              <div className="rounded-xl bg-secondary/40 p-4 border border-border/60 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400">
                  Value Pitch Points for Business Owner
                </div>
                <ul className="space-y-1.5">
                  {pitchPoints.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground font-sans">
                      <Check className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PhaseShell>
  );
}

function demoSiteHtml(l: RankedLead): string {
  const wa = (l.whatsapp ?? l.phone ?? "919999999999").replace(/\D/g, "");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${l.name}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>body{font-family:ui-serif,Georgia,'Times New Roman',serif;background:#f5efe6;color:#2c2620}h1,h2,.sans{font-family:ui-sans-serif,system-ui,sans-serif}</style>
</head><body>
<header class="border-b border-stone-200 bg-[#faf6ee]"><div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between"><div class="font-medium tracking-tight text-stone-800">${l.name}</div><a href="tel:${(l.phone ?? "").replace(/\s/g, "")}" class="text-sm text-stone-600 sans">${l.phone ?? ""}</a></div></header>
<section><div class="max-w-5xl mx-auto px-6 py-20 sm:py-28"><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 sans">${l.category} · ${l.city}</div><h1 class="text-4xl sm:text-6xl font-medium mt-4 leading-[1.05] tracking-tight text-stone-900">A name ${l.city.split(",")[0]}<br/>has trusted for years.<br/><span class="italic text-stone-500">Now online.</span></h1><p class="mt-6 text-lg text-stone-600 max-w-xl leading-relaxed">${l.rating}★ on Google · ${l.reviewsCount} reviews. Book in under a minute on WhatsApp — no calls, no waiting.</p><div class="mt-8 flex gap-3 sans"><a href="https://wa.me/${wa}" class="bg-stone-900 text-stone-50 font-medium px-7 py-3.5 rounded-full text-sm tracking-wide hover:bg-stone-700 transition">Book on WhatsApp →</a><a href="tel:${(l.phone ?? "").replace(/\s/g, "")}" class="border border-stone-300 text-stone-700 px-7 py-3.5 rounded-full text-sm tracking-wide">Call us</a></div></div></section>
<section class="bg-[#ede4d3] border-y border-stone-200"><div class="max-w-5xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-8 text-center"><div><div class="text-4xl font-medium tracking-tight text-stone-900">${l.reviewsCount}+</div><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 mt-2 sans">Happy customers</div></div><div><div class="text-4xl font-medium tracking-tight text-stone-900">${l.rating}★</div><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 mt-2 sans">Google rating</div></div><div><div class="text-4xl font-medium tracking-tight text-stone-900">${l.yearsInBusiness ?? 8}+</div><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 mt-2 sans">Years in ${l.city.split(",")[0]}</div></div></div></section>
<section class="max-w-5xl mx-auto px-6 py-16"><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 sans">Services</div><h2 class="text-3xl font-medium tracking-tight text-stone-900 mt-2">What we do well.</h2><div class="grid sm:grid-cols-3 gap-px bg-stone-200 mt-8 border border-stone-200">${["Service one","Service two","Service three","Service four","Service five","Service six"].map((s)=>`<div class="bg-[#faf6ee] p-6"><div class="font-medium tracking-tight text-stone-900">${s}</div><div class="text-xs text-stone-500 mt-1.5 sans">Reliable · modern · affordable</div></div>`).join("")}</div></section>
<section class="max-w-5xl mx-auto px-6 py-16 border-t border-stone-200"><div class="text-[11px] uppercase tracking-[0.2em] text-stone-500 sans">Visit us</div><h2 class="text-3xl font-medium tracking-tight text-stone-900 mt-2">${l.address}</h2><div class="mt-6 rounded-lg overflow-hidden bg-stone-200/60 border border-stone-300 h-64 flex items-center justify-center text-stone-500 sans text-sm">[Google Maps Embed]</div></section>
</body></html>`;
}
