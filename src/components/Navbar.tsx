"use client";

import React from "react";
import {
  ShieldAlert,
  Cpu,
  Lock,
  GraduationCap,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  currentView: "studio" | "lab";
  onSelectView: (view: "studio" | "lab") => void;
  onOpenHistory: () => void;
}

export function Navbar({
  currentView,
  onSelectView,
  onOpenHistory,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div
          onClick={() => onSelectView("studio")}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight">
                The Manipulation <span className="text-cyan-400">Decoder</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 uppercase tracking-wider">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Decode the message. Detect the manipulation. Defend yourself.
            </p>
          </div>
        </div>

        {/* View Switcher: Studio vs Training Lab */}
        <div className="flex items-center space-x-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => onSelectView("studio")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              currentView === "studio"
                ? "bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Investigation Studio</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView("lab")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              currentView === "lab"
                ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Training Lab</span>
          </button>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onOpenHistory}
            className="px-2.5 py-1.5 rounded-lg bg-surface border border-slate-700 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors"
            title="Open local browser case history"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">History</span>
          </button>

          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Local Engine Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
}
