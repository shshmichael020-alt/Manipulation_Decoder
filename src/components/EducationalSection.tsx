"use client";

import React from "react";
import {
  ShieldCheck,
  AlertOctagon,
  Eye,
  KeyRound,
  PhoneCall,
  Clock,
  Compass,
} from "lucide-react";

export function EducationalSection() {
  const principles = [
    {
      title: "1. Manufactured Urgency",
      desc: "Attackers constrain your reaction time ('within 15 minutes', 'immediate action required') to bypass analytical scrutiny and trigger impulsive panic.",
      counter: "Deliberately pause for 5 minutes. Legitimate institutions do not self-destruct accounts without prior recorded notices.",
    },
    {
      title: "2. Authority Impersonation",
      desc: "Impersonating executives (CEO fraud), legal enforcement (IRS/Police), or IT admins to exploit conditioned obedience.",
      counter: "Demand out-of-band verification. Confirm via internal company directories or known official phone lines.",
    },
    {
      title: "3. Enforced Secrecy & Isolation",
      desc: "'Do not discuss this with anyone', 'keep this strictly confidential'. Attackers isolate you so colleagues cannot spot the fraud.",
      counter: "Break secrecy immediately. Dual-signoff and consultation with colleagues is standard security protocol.",
    },
    {
      title: "4. Curiosity & Social Bait",
      desc: "Appealing to voyeurism, office gossip, or unearned windfall rewards ('look at what was posted about you', 'unclaimed prize').",
      counter: "If an unexpected message promises an unearned reward or sensational rumor, treat any attached link as hostile.",
    },
  ];

  return (
    <section id="educational-guide" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-12">
      <div className="cyber-card rounded-xl p-6 border border-surface-border">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              The Cognitive Defense Playbook
            </h2>
            <p className="text-xs text-slate-400">
              How social engineers exploit human psychology and how to defend yourself
            </p>
          </div>
        </div>

        {/* 4 Core psychological vectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {principles.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-surface border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wide mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">
                {item.desc}
              </p>
              <div className="text-[11px] text-emerald-400 font-medium bg-emerald-950/30 p-2 rounded border border-emerald-500/20">
                <span className="font-bold">Defense:</span> {item.counter}
              </div>
            </div>
          ))}
        </div>

        {/* The S.L.O.W. Framework banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1">
              Golden Cybersecurity Rule: The S.L.O.W. Framework
            </div>
            <div className="text-xs text-slate-300 space-y-0.5">
              <div><strong className="text-cyan-300">S</strong>top — Never act instantly on panic.</div>
              <div><strong className="text-cyan-300">L</strong>ook — Inspect the actual sender domain and link syntax.</div>
              <div><strong className="text-cyan-300">O</strong>ut-of-band verify — Contact the sender through a known, trusted channel.</div>
              <div><strong className="text-cyan-300">W</strong>ithhold credentials — Never enter or share OTPs or passwords over chat/email.</div>
            </div>
          </div>
          <div className="shrink-0 p-3 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-center font-mono text-xs hidden sm:block">
            <KeyRound className="w-6 h-6 mx-auto mb-1 text-cyan-400" />
            <span>Zero-Trust</span>
          </div>
        </div>
      </div>
    </section>
  );
}
