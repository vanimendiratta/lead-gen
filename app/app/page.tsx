"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { AuthPage, type AuthUser } from "@/components/AuthPage";
import { OverviewDashboard } from "@/components/OverviewDashboard";
import { Phase1Scrape } from "@/components/Phase1Scrape";
import { Phase2Audit } from "@/components/Phase2Audit";
import { Phase3Rank } from "@/components/Phase3Rank";
import { Phase4Build } from "@/components/Phase4Build";
import { Phase5Outreach } from "@/components/Phase5Outreach";
import type { Lead, AuditResult, RankedLead } from "@/lib/types";

export default function Page() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "phase">("overview");
  const [phase, setPhase] = useState(1);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [audits, setAudits] = useState<Record<string, AuditResult>>({});
  const [ranked, setRanked] = useState<RankedLead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [claudeOk, setClaudeOk] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lead_to_launch_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse stored user session", e);
    } finally {
      setAuthChecked(true);
    }

    fetch("/api/claude-status")
      .then((r) => r.json())
      .then((d) => setClaudeOk(!!d.installed))
      .catch(() => setClaudeOk(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem("lead_to_launch_user");
    setUser(null);
  }

  const completedPhases = useMemo(() => {
    const s = new Set<number>();
    if (leads.length > 0) s.add(1);
    if (Object.keys(audits).length > 0) s.add(2);
    if (ranked.length > 0) s.add(3);
    if (selectedId) s.add(4);
    if (selectedId) s.add(5);
    return s;
  }, [leads, audits, ranked, selectedId]);

  const selectedRanked = useMemo(
    () => ranked.find((r) => r.id === selectedId) ?? null,
    [ranked, selectedId]
  );

  if (!authChecked) {
    return null; // Prevents flash before checking localStorage session
  }

  if (!user) {
    return <AuthPage onLogin={(u) => setUser(u)} />;
  }

  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
      currentPhase={phase}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      completedPhases={completedPhases}
      claudeOk={claudeOk}
      leads={leads}
      onPhaseChange={(p) => {
        setPhase(p);
        setActiveTab("phase");
      }}
    >
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <OverviewDashboard
            key="overview"
            leads={leads}
            audits={audits}
            ranked={ranked}
            selectedId={selectedId}
            completedPhases={completedPhases}
            onNavigatePhase={(p) => {
              setPhase(p);
              setActiveTab("phase");
            }}
          />
        )}

        {activeTab === "phase" && phase === 1 && (
          <Phase1Scrape
            key="p1"
            leads={leads}
            setLeads={setLeads}
            onNext={() => setPhase(2)}
          />
        )}

        {activeTab === "phase" && phase === 2 && (
          <Phase2Audit
            key="p2"
            leads={leads}
            audits={audits}
            setAudits={setAudits}
            onNext={() => setPhase(3)}
            onPrev={() => setPhase(1)}
          />
        )}

        {activeTab === "phase" && phase === 3 && (
          <Phase3Rank
            key="p3"
            leads={leads}
            audits={audits}
            ranked={ranked}
            setRanked={setRanked}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onNext={() => setPhase(4)}
            onPrev={() => setPhase(2)}
          />
        )}

        {activeTab === "phase" && phase === 4 && (
          <Phase4Build
            key="p4"
            selected={selectedRanked}
            onNext={() => setPhase(5)}
            onPrev={() => setPhase(3)}
          />
        )}

        {activeTab === "phase" && phase === 5 && (
          <Phase5Outreach
            key="p5"
            selected={selectedRanked}
            onPrev={() => setPhase(4)}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
