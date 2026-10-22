"use client";

import React from "react";
import { ShieldCheck, Lock, Activity, Sparkles, Brain, AlertTriangle, Link2 } from "lucide-react";

export function Hero() {
  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2 gap-4">
      {/* Privacy & Sub-zero Telemetry Status Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-outline-variant/30 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/5 pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline-sm text-xs sm:text-sm text-on-surface font-semibold">
                Client-Side Heuristic Engine Active
              </span>
              <span className="font-telemetry-pill text-[10px] px-1.5 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/30 uppercase font-bold tracking-wider">
                Air-Gapped Sandbox
              </span>
            </div>
            <span className="text-xs text-on-surface-variant">
              Submissions are parsed in ephemeral browser memory; zero external telemetry, zero LLM ingestion leaks.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10 self-end sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low border border-secondary/20 text-secondary font-code-ioc text-xs">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            <span>Memory Integrity: Validated</span>
          </div>
          <span className="font-code-ioc text-xs px-2 py-1 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface-variant">
            RFC-5322 Compliant
          </span>
        </div>
      </div>

      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-code-ioc text-xs text-primary font-bold">MODULE // 01</span>
            <span className="text-on-surface-variant/40 font-code-ioc text-xs">/</span>
            <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase tracking-widest">
              INGESTION & DECONSTRUCTION LAB
            </span>
          </div>
          <h1 className="font-display-xl text-2xl sm:text-4xl lg:text-5xl tracking-tight text-on-surface font-extrabold leading-tight">
            Investigate a message before you trust it.
          </h1>
          <p className="font-body-base text-sm sm:text-base text-on-surface-variant mt-2 leading-relaxed">
            Deterministic inspection of psychological coercion, deceptive urgency, weaponized domains, email envelope spoofing, and synthetic linguistic markers.
          </p>
        </div>

        {/* Live Telemetry Spark Metric */}
        <div className="flex items-center gap-4 self-start md:self-auto bg-surface-container-lowest border border-outline-variant/30 p-3 rounded-xl shadow-sm shrink-0">
          <div className="flex flex-col text-right">
            <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase tracking-wider">
              Local Heuristics Loaded
            </span>
            <span className="font-stat-score text-2xl sm:text-3xl text-primary font-extrabold leading-none tnum">
              142
            </span>
          </div>
          <div className="w-16 h-8 flex items-end gap-1">
            <span className="w-2 h-3 rounded bg-surface-container-high" />
            <span className="w-2 h-5 rounded bg-primary/40 animate-pulse" />
            <span className="w-2 h-7 rounded bg-primary/70" />
            <span className="w-2 h-4 rounded bg-primary/50" />
            <span className="w-2 h-8 rounded bg-primary" />
            <span className="w-2 h-6 rounded bg-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}
