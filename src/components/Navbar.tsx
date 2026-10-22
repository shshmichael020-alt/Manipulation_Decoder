"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  GraduationCap,
  Layers,
  History,
  Lock,
  Search,
  Sparkles,
} from "lucide-react";
import { getSavedCases } from "@/lib/storage/case-history";

interface NavbarProps {
  currentView: "studio" | "lab";
  onSelectView: (view: "studio" | "lab") => void;
  onOpenHistory: () => void;
  caseCount?: number;
}

export function Navbar({
  currentView,
  onSelectView,
  onOpenHistory,
  caseCount: propCaseCount,
}: NavbarProps) {
  const [storedCount, setStoredCount] = useState<number>(0);

  useEffect(() => {
    try {
      const history = getSavedCases();
      setStoredCount(history.length);
    } catch {
      // Ignore
    }
  }, []);

  const count = propCaseCount !== undefined ? propCaseCount : storedCount;

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant/30 flex items-center justify-between px-4 sm:px-6 shadow-[0_1px_12px_rgba(0,0,0,0.4)]">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => onSelectView("studio")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(143,240,255,0.2)] group-hover:border-primary/60 transition-all">
            <ShieldAlert className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-sm sm:text-base tracking-wide text-on-surface font-bold uppercase">
              The Manipulation <span className="text-primary">Decoder</span>
            </span>
            <span className="font-telemetry-pill text-[10px] text-on-surface-variant/80 tracking-widest uppercase hidden sm:inline">
              Cognitive Security Workstation
            </span>
          </div>
        </div>
      </div>

      {/* View Switcher: Studio vs Training Lab */}
      <div className="flex items-center gap-2">
        <div className="bg-surface-container-low p-1 rounded-lg border border-outline-variant/40 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectView("studio")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === "studio"
                ? "bg-primary text-on-primary font-bold shadow-[0_0_12px_rgba(143,240,255,0.35)]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Investigation Studio</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView("lab")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === "lab"
                ? "bg-tertiary-container text-on-tertiary font-bold shadow-[0_0_12px_rgba(244,187,100,0.35)]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Training Lab</span>
            <span className="text-[10px] px-1 rounded bg-surface-container-high text-on-surface font-mono">6</span>
          </button>
        </div>
      </div>

      {/* Right Controls: Zero-Telemetry pill, Case History */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low border border-secondary/30 text-secondary">
          <Lock className="w-3.5 h-3.5 text-secondary" />
          <span className="font-telemetry-pill text-[10px] uppercase tracking-wider font-semibold">
            Zero-Telemetry Engine
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
        </div>

        {/* History Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="relative p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-colors"
          title="Case History (Stored locally in browser)"
        >
          <History className="w-4 h-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 font-telemetry-pill text-[9px] bg-primary text-on-primary px-1.5 rounded-full font-bold leading-none py-0.5 shadow-sm">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
