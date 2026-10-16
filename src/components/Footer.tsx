"use client";

import React from "react";
import { ShieldCheck, Heart, Lock, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-border bg-background py-8 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <div className="flex items-center justify-center sm:justify-start space-x-2 text-slate-300 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>The Manipulation Decoder</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Decode the message. Detect the manipulation. Defend yourself.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-[11px]">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client Privacy Guarantee (Zero Retention)</span>
          </div>
          <span className="hidden sm:inline text-slate-700">•</span>
          <div className="flex items-center space-x-1 text-slate-400">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Built for Hackathon Demo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
