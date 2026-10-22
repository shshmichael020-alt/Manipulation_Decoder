"use client";

import React from "react";
import { ShieldCheck, Lock, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant/30 bg-surface-container-lowest py-8 text-on-surface-variant text-xs mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-on-surface font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-headline-sm uppercase tracking-wide">The Manipulation Decoder</span>
          </div>
          <p className="text-[11px] text-on-surface-variant/70">
            Decode the message. Detect the manipulation. Defend yourself.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-secondary">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Telemetry Ephemeral Sandbox</span>
          </div>
          <span className="hidden sm:inline text-outline-variant">•</span>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Code2 className="w-3.5 h-3.5 text-primary" />
            <span>STIX 2.1 & MITRE ATT&CK v14.1 Connected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
