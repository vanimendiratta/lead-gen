"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  Trophy,
  Wand2,
  Send,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Search,
  Command,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { Stepper } from "./Stepper";
import { ParticleBackground } from "./ParticleBackground";
import { CommandPalette } from "./CommandPalette";
import type { Lead } from "@/lib/types";

export interface AppShellProps {
  currentPhase: number;
  activeTab: "overview" | "phase";
  setActiveTab: (tab: "overview" | "phase") => void;
  completedPhases: Set<number>;
  claudeOk: boolean | null;
  leads: Lead[];
  onPhaseChange: (phase: number) => void;
  children: React.ReactNode;
}

export function AppShell({
  currentPhase,
  activeTab,
  setActiveTab,
  completedPhases,
  claudeOk,
  leads,
  onPhaseChange,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const navItems = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard, isOverview: true, color: "text-emerald-400" },
    { id: 1, label: "1. Discover Leads", icon: MapPin, phase: 1, color: "text-[color:var(--phase-discover)]" },
    { id: 2, label: "2. Audit Engine", icon: ShieldAlert, phase: 2, color: "text-[color:var(--phase-audit)]" },
    { id: 3, label: "3. Rank Prospects", icon: Trophy, phase: 3, color: "text-[color:var(--phase-rank)]" },
    { id: 4, label: "4. AI Site Builder", icon: Wand2, phase: 4, color: "text-[color:var(--phase-build)]" },
    { id: 5, label: "5. Cold Outreach", icon: Send, phase: 5, color: "text-[color:var(--phase-outreach)]" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden bg-digital-mesh relative">
      {/* Subtle particle background drift */}
      <ParticleBackground />

      {/* ⌘K Command Palette Modal */}
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        leads={leads}
        onNavigatePhase={(p) => {
          onPhaseChange(p);
          setActiveTab("phase");
        }}
        onNavigateOverview={() => setActiveTab("overview")}
      />

      {/* Desktop Sidebar Navigation */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex relative z-40 flex-col border-r border-sidebar-border bg-sidebar shrink-0 select-none"
      >
        {/* Sidebar Header / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/30">
              <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" strokeWidth={2} />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="font-display font-bold text-base tracking-tight gradient-text-emerald">
                  Lead → Launch
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                  Command Center
                </span>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Sidebar Nav List */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-sidebar-foreground/50">
              Workflows
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.isOverview
                ? activeTab === "overview"
                : activeTab === "phase" && currentPhase === item.phase;
            const isCompleted = item.phase ? completedPhases.has(item.phase) : false;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isOverview) {
                    setActiveTab("overview");
                  } else if (item.phase) {
                    setActiveTab("phase");
                    onPhaseChange(item.phase);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-950/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? item.color : "text-sidebar-foreground/60"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && isCompleted && !isActive && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                )}
                {collapsed && isActive && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer — System Health */}
        <div className="p-3 border-t border-sidebar-border/60 bg-sidebar-accent/30">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-card/60 border border-border/50">
            <div className="relative shrink-0">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <span
                className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${
                  claudeOk === null
                    ? "bg-amber-400 animate-pulse"
                    : claudeOk
                    ? "bg-emerald-400 shadow-sm shadow-emerald-400"
                    : "bg-destructive"
                }`}
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-mono font-medium truncate">
                  {claudeOk === null
                    ? "Checking CLI..."
                    : claudeOk
                    ? "Claude Code CLI"
                    : "CLI Disconnected"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {claudeOk ? "Subprocess active" : "Install required"}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-border/60 glass-panel px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-secondary text-foreground"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setActiveTab("overview")}
              className={`text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "text-emerald-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </button>
            <span className="text-border">/</span>
            <span className="text-sm font-semibold truncate text-foreground">
              {activeTab === "overview"
                ? "Mission Control Overview"
                : navItems.find((n) => n.phase === currentPhase)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* ⌘K Trigger Button */}
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/60 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search / Commands</span>
              <kbd className="hidden sm:inline-flex h-4 select-none items-center gap-0.5 rounded bg-background px-1 text-[10px] text-muted-foreground border border-border/60">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </button>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Zap className="h-3.5 w-3.5" />
              <span>Local AI Engine</span>
            </div>
          </div>
        </header>

        {/* Phase Stepper Header (When in phase workflow view) */}
        {activeTab === "phase" && (
          <div className="border-b border-border/60 bg-card/40 backdrop-blur-md px-4 sm:px-8 py-3">
            <Stepper
              current={currentPhase}
              completed={completedPhases}
              onJump={(n) => {
                setActiveTab("phase");
                onPhaseChange(n);
              }}
            />
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-72 h-full bg-sidebar border-r border-sidebar-border p-4 flex flex-col space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-sidebar-border/60 pb-3">
                <div className="font-bold text-base gradient-text-emerald">Lead → Launch Studio</div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.isOverview) {
                          setActiveTab("overview");
                        } else if (item.phase) {
                          setActiveTab("phase");
                          onPhaseChange(item.phase);
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <Icon className={`h-4 w-4 ${item.color}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
