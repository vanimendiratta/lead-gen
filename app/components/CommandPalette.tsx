"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  Trophy,
  Wand2,
  Send,
  Search,
  Command,
} from "lucide-react";
import type { Lead } from "@/lib/types";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
  onNavigatePhase: (phase: number) => void;
  onNavigateOverview: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  leads,
  onNavigatePhase,
  onNavigateOverview,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const commands = [
    { label: "Dashboard Overview", action: onNavigateOverview, icon: LayoutDashboard, category: "Navigation" },
    { label: "Phase 1 — Lead Scraper", action: () => onNavigatePhase(1), icon: MapPin, category: "Navigation" },
    { label: "Phase 2 — Business Audit", action: () => onNavigatePhase(2), icon: ShieldAlert, category: "Navigation" },
    { label: "Phase 3 — Rank Prospects", action: () => onNavigatePhase(3), icon: Trophy, category: "Navigation" },
    { label: "Phase 4 — AI Site Builder", action: () => onNavigatePhase(4), icon: Wand2, category: "Navigation" },
    { label: "Phase 5 — Cold Outreach", action: () => onNavigatePhase(5), icon: Send, category: "Navigation" },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLeads = leads.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    l.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl glass-card border border-border/80 p-0 overflow-hidden shadow-2xl rounded-2xl">
        <div className="flex items-center px-4 border-b border-border/60">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search leads... (ESC to exit)"
            className="h-12 border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-0 font-mono text-foreground placeholder:text-muted-foreground/60"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded bg-secondary px-1.5 font-mono text-[10px] font-medium text-muted-foreground border border-border/60">
            <Command className="h-3 w-3" /> K
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-4 font-mono">
          <div>
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Pipeline Workflows
            </div>
            <div className="space-y-0.5">
              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      cmd.action();
                      onOpenChange(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors text-left"
                  >
                    <Icon className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{cmd.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {leads.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Scraped Business Leads ({filteredLeads.length})
              </div>
              <div className="space-y-0.5">
                {filteredLeads.slice(0, 5).map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => {
                      onNavigatePhase(2);
                      onOpenChange(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors text-left"
                  >
                    <div className="truncate">
                      <span className="font-semibold text-foreground">{lead.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">({lead.category})</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                      {lead.rating}★ ({lead.reviewsCount})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
