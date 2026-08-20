"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { PhaseShell } from "./PhaseShell";
import { Loader2, MapPin, Phone, Star, Globe, MessageCircle, Mail, Search, Compass } from "lucide-react";
import type { Lead, ScrapeInput } from "@/lib/types";
import { toast } from "sonner";

const LeadMap = dynamic(() => import("./LeadMap"), { ssr: false });

export function Phase1Scrape({
  leads,
  setLeads,
  onNext,
  onPrev,
}: {
  leads: Lead[];
  setLeads: (l: Lead[]) => void;
  onNext: () => void;
  onPrev?: () => void;
}) {
  const [input, setInput] = useState<ScrapeInput>({ niche: "Dentist", city: "Delhi", count: 12 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [scrapeSource, setScrapeSource] = useState<string | null>(null);

  async function runScrape() {
    setLoading(true);
    setLeads([]);
    setScrapeSource(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Server returned status ${res.status}. Please try again.`);
      }
      if (!res.ok) throw new Error(data.error ?? `Scrape failed (${res.status})`);
      setScrapeSource(data.source);
      for (let i = 0; i < (data.leads?.length ?? 0); i++) {
        await new Promise((r) => setTimeout(r, 60));
        setLeads(data.leads.slice(0, i + 1));
      }
      if (data.source === "seed" || data.source === "seed-fallback") {
        toast.info(`Generated seed leads for ${input.city} (Add APIFY_TOKEN for live scraping)`);
      } else {
        toast.success(`Scraped ${data.leads.length} live leads from ${input.city}`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PhaseShell
      title="Phase 1 — Discover Local Leads"
      subtitle="Extract target businesses from Google Maps with phone, email, WhatsApp, coordinates, and website status."
      onPrev={onPrev}
      onNext={onNext}
      nextDisabled={leads.length === 0}
      nextLabel="Audit leads with AI →"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Scraper Parameters Form */}
        <Card className="glass-card lg:col-span-1 border border-cyan-500/30 rounded-2xl shadow-xl">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Compass className="h-4 w-4 text-[color:var(--phase-discover)]" />
              Target Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="niche" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Niche / Category
              </Label>
              <Input
                id="niche"
                autoComplete="off"
                value={input.niche}
                onChange={(e) => setInput({ ...input, niche: e.target.value })}
                placeholder="e.g. Dentist, Salon, Gym"
                className="h-10 text-sm bg-secondary/50 border-border/80"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Target Location
              </Label>
              <Input
                id="city"
                autoComplete="off"
                value={input.city}
                onChange={(e) => setInput({ ...input, city: e.target.value })}
                placeholder="e.g. Bandra, Mumbai"
                className="h-10 text-sm bg-secondary/50 border-border/80"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="count" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Lead Count
              </Label>
              <Input
                id="count"
                type="number"
                inputMode="numeric"
                min={1}
                max={50}
                value={input.count}
                onChange={(e) => setInput({ ...input, count: Number(e.target.value) })}
                className="h-10 text-sm font-mono bg-secondary/50 border-border/80"
              />
              <p className="text-[11px] text-muted-foreground font-mono">
                Uses Apify Google Places crawler (or local seed data fallback).
              </p>
            </div>

            <Button
              onClick={runScrape}
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-950/40 active:scale-[0.98] transition-transform"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning Google Maps...
                </>
              ) : (
                "Scrape Target Leads"
              )}
            </Button>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <Stat label="Total" value={leads.length} />
              <Stat label="With Phone" value={leads.filter((l) => l.phone).length} />
              <Stat label="No Site" value={leads.filter((l) => !l.website).length} highlight />
            </div>
          </CardContent>
        </Card>

        {/* Live Interactive Map */}
        <Card className="glass-card lg:col-span-2 border border-border/60 rounded-2xl shadow-xl">
          <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-400" />
              Geographic Intelligence Map
            </CardTitle>
            <span className="text-xs font-mono text-muted-foreground">
              {leads.length > 0 ? `${leads.length} Pin markers` : "Awaiting scrape"}
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <LeadMap
              leads={leads}
              activeLeadId={activeLeadId}
              onSelectLead={(id) => setActiveLeadId(id)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Scraped Results Directory Table */}
      <Card className="glass-card border border-border/60 rounded-2xl shadow-xl mt-6">
        <CardHeader className="border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold">Scraped Business Directory</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Showing {filteredLeads.length} of {leads.length} leads
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter leads..."
              className="h-8 text-xs pl-8 bg-secondary/40 border-border/60 font-mono"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {scrapeSource && (scrapeSource === "seed" || scrapeSource === "seed-fallback") && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-3 text-xs flex items-center justify-between gap-2">
              <span>
                <strong>Offline Demo Mode:</strong> <code className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-[11px]">APIFY_TOKEN</code> is not set. Showing simulated leads for <strong>{input.city}</strong> ({input.niche}). Add an Apify token to scrape live Google Maps data.
              </span>
              <Badge variant="outline" className="border-amber-500/40 text-amber-300 text-[10px] shrink-0 font-mono">
                Offline Seed Data
              </Badge>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="w-12 font-mono text-xs">#</TableHead>
                  <TableHead className="text-xs">Business Name & Address</TableHead>
                  <TableHead className="text-xs">Contact Channels</TableHead>
                  <TableHead className="text-xs">Google Reviews</TableHead>
                  <TableHead className="text-xs">Website Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence initial={false}>
                  {filteredLeads.map((l, i) => {
                    const isSelected = activeLeadId === l.id;
                    return (
                      <motion.tr
                        key={l.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        onMouseEnter={() => setActiveLeadId(l.id)}
                        onClick={() => setActiveLeadId(l.id)}
                        className={`border-b border-border/40 cursor-pointer transition-colors ${
                          isSelected ? "bg-cyan-500/10" : "hover:bg-secondary/40"
                        }`}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm text-foreground">{l.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                            <MapPin className="h-3 w-3 text-cyan-400/80 shrink-0" /> {l.address}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          <div className="flex flex-col gap-1">
                            {l.phone && (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="h-3 w-3 text-muted-foreground" /> {l.phone}
                              </span>
                            )}
                            {l.whatsapp && (
                              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                                <MessageCircle className="h-3 w-3" /> WhatsApp
                              </span>
                            )}
                            {l.email && (
                              <span className="flex items-center gap-1.5 text-indigo-400">
                                <Mail className="h-3 w-3" /> {l.email}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-foreground">{l.rating?.toFixed(1) ?? "—"}</span>
                            <span className="text-muted-foreground">({l.reviewsCount ?? 0})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {l.website ? (
                            <Badge variant="secondary" className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                              <Globe className="h-3 w-3 mr-1" /> Active Site
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs font-mono text-rose-400 border-rose-500/30 bg-rose-500/10">
                              No Website
                            </Badge>
                          )}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
            {leads.length === 0 && !loading && (
              <div className="text-center py-12 text-xs font-mono text-muted-foreground">
                No leads scraped yet. Enter parameters above and click &quot;Scrape Target Leads&quot;.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PhaseShell>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${highlight ? "border-rose-500/30 bg-rose-500/5" : "border-border/60 bg-secondary/30"}`}>
      <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-xl font-bold tabular-nums mt-0.5 ${highlight ? "text-rose-400" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
