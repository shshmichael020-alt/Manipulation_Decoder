"use client";

import React from "react";
import { Shield, Brain, AlertTriangle, Link2, Sparkles, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <div className="relative pt-8 pb-6 text-center max-w-4xl mx-auto px-4 sm:px-6">
      {/* Top pill */}
      <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Defensive Cyber Intelligence & Cognitive Security</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
        Expose Cognitive Coercion. <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
          Neutralize Phishing Before You Respond.
        </span>
      </h1>

      <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6">
        Attackers don&apos;t just hack systems—they hack human psychology through fear, urgency, authority, and false trust. 
        Paste any email, SMS, or direct message to dissect manipulative tactics, inspect concealed URLs, and evaluate AI-writing markers.
      </p>

      {/* Feature capabilities tags */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto text-left">
        <div className="p-3 rounded-lg bg-surface-card border border-surface-border flex items-start space-x-2.5">
          <Brain className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-slate-200">13 Psychological Tactics</div>
            <div className="text-[11px] text-slate-400">Urgency, authority, fear, secrecy</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-card border border-surface-border flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-slate-200">Phishing Heuristics</div>
            <div className="text-[11px] text-slate-400">Credential theft, OTP lures, BEC</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-card border border-surface-border flex items-start space-x-2.5">
          <Link2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-slate-200">Safe URL Inspection</div>
            <div className="text-[11px] text-slate-400">Punycode, typosquats, shorteners</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-card border border-surface-border flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-slate-200">AI-Writing Likelihood</div>
            <div className="text-[11px] text-slate-400">Experimental stylometrics</div>
          </div>
        </div>
      </div>
    </div>
  );
}
