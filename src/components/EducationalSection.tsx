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
  Sparkles,
} from "lucide-react";

export function EducationalSection() {
  const principles = [
    {
      title: "1. Manufactured Urgency",
      desc: "Attackers constrain your reaction time ('within 45 minutes', 'immediate action required') to bypass analytical scrutiny and trigger impulsive panic.",
      counter: "Deliberately pause for 5 minutes. Legitimate financial institutions do not execute account suspension without recorded prior notices.",
    },
    {
      title: "2. Authority Impersonation",
      desc: "Impersonating executives (CEO fraud), legal enforcement, or IT support to exploit conditioned organizational obedience.",
      counter: "Demand out-of-band verification. Confirm via internal corporate phone directories before clicking or releasing assets.",
    },
    {
      title: "3. Enforced Secrecy & Isolation",
      desc: "'Do not discuss this wire with anyone', 'keep this strictly confidential'. Attackers isolate you so colleagues cannot spot the fraud.",
      counter: "Break secrecy immediately. Multi-party verification and consultation with team members is standard security protocol.",
    },
    {
      title: "4. Curiosity & Social Proof Bait",
      desc: "Appealing to voyeurism, payroll adjustments, or unearned benefits ('look at what was posted about you', 'revised bonus allocation').",
      counter: "If an unexpected message promises an unearned reward or unusual confidential memo, treat attached URLs as hostile.",
    },
  ];

  return (
    <section id="educational-guide" className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-10">
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-xl flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(143,240,255,0.2)]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-lg text-lg sm:text-xl font-bold text-on-surface">
                The Cognitive Defense Playbook
              </h2>
              <span className="font-telemetry-pill text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-primary uppercase">
                HEURISTIC RUNBOOK
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              How social engineers exploit human cognitive biases and how to neutralize attacks in real-time.
            </p>
          </div>
        </div>

        {/* 4 Core psychological vectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {principles.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/50 transition-all flex flex-col gap-2"
            >
              <h3 className="text-xs font-bold font-mono text-primary uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="text-xs text-on-surface leading-relaxed">
                {item.desc}
              </p>
              <div className="text-[11px] text-secondary font-medium bg-secondary/10 p-2.5 rounded-lg border border-secondary/20">
                <span className="font-bold">Defensive Action:</span> {item.counter}
              </div>
            </div>
          ))}
        </div>

        {/* The S.L.O.W. Framework banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Golden Cognitive Rule: The S.L.O.W. Protocol</span>
            </div>
            <div className="text-xs text-on-surface space-y-1">
              <div><strong className="text-primary font-mono">S</strong>top — Never act instantly on panic or manufactured scarcity.</div>
              <div><strong className="text-primary font-mono">L</strong>ook — Inspect the actual envelope sender and destination syntax.</div>
              <div><strong className="text-primary font-mono">O</strong>ut-of-band verify — Validate through a known, trusted corporate line.</div>
              <div><strong className="text-primary font-mono">W</strong>ithhold credentials — Never submit passwords or MFA OTP tokens on links.</div>
            </div>
          </div>
          <div className="shrink-0 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-primary text-center font-mono text-xs hidden sm:block">
            <KeyRound className="w-6 h-6 mx-auto mb-1 text-primary" />
            <span>Zero-Trust Protocol</span>
          </div>
        </div>
      </div>
    </section>
  );
}
