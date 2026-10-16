"use client";

import React, { useState } from "react";
import { TRAINING_SCENARIOS, TrainingScenario } from "@/data/training-lab";
import {
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface TrainingLabViewProps {
  onAnalyzeSample: (message: string, senderName: string, senderAddress: string) => void;
}

export function TrainingLabView({ onAnalyzeSample }: TrainingLabViewProps) {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [userGuess, setUserGuess] = useState<"DANGEROUS_PHISHING" | "SAFE_BENIGN" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const scenario = TRAINING_SCENARIOS[selectedScenarioIndex];

  const handleGuess = (guess: "DANGEROUS_PHISHING" | "SAFE_BENIGN") => {
    setUserGuess(guess);
    setRevealed(true);
    const isCorrect = guess === scenario.correctVerdict;
    setScore((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    setUserGuess(null);
    setRevealed(false);
    setSelectedScenarioIndex((prev) => (prev + 1) % TRAINING_SCENARIOS.length);
  };

  const handleResetLab = () => {
    setSelectedScenarioIndex(0);
    setUserGuess(null);
    setRevealed(false);
    setScore({ correct: 0, total: 0 });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-surface-border mb-6 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Interactive Cybersecurity Training Lab</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-purple-300">
                Practice Mode
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Test your cognitive defense instincts on realistic threat simulations before checking the engine.
            </p>
          </div>
        </div>

        {/* Score indicator */}
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-lg bg-surface border border-slate-700 text-xs font-mono text-slate-300">
            Score: <strong className="text-cyan-400">{score.correct}</strong> / {score.total}
          </div>
          <button
            type="button"
            onClick={handleResetLab}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset training lab score"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scenario Navigation Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TRAINING_SCENARIOS.map((sc, idx) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => {
              setSelectedScenarioIndex(idx);
              setUserGuess(null);
              setRevealed(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              selectedScenarioIndex === idx
                ? "bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold"
                : "bg-surface border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Scenario {idx + 1}
          </button>
        ))}
      </div>

      {/* Target Scenario Card */}
      <div className="cyber-card rounded-xl p-5 border border-surface-border shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 uppercase">
              {scenario.category}
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              {scenario.title}
            </h3>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-400">
            <div>From: {scenario.senderDisplay}</div>
            <div className="text-slate-500">{scenario.senderAddress}</div>
          </div>
        </div>

        {/* Message preview window */}
        <div className="p-4 rounded-lg bg-surface border border-slate-800/80 font-sans text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed mb-4">
          {scenario.messageText}
        </div>

        {/* Voting / Interactive Guess Section */}
        {!revealed ? (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider mb-3">
              What is your security assessment?
            </h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleGuess("DANGEROUS_PHISHING")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-950/80 border border-red-500/40 hover:bg-red-900 text-red-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Looks Suspicious / Phishing Threat</span>
              </button>

              <button
                type="button"
                onClick={() => handleGuess("SAFE_BENIGN")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Looks Safe / Authentic Communication</span>
              </button>
            </div>
          </div>
        ) : (
          /* Revealed Analysis Card */
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                {userGuess === scenario.correctVerdict ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">
                      Correct Assessment!
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">
                      Deceptive Trap! Your guess was incorrect.
                    </span>
                  </>
                )}
              </div>

              <span
                className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  scenario.correctVerdict === "DANGEROUS_PHISHING"
                    ? "bg-red-950 text-red-300 border-red-500/40"
                    : "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                }`}
              >
                True State: {scenario.correctVerdict.replace("_", " ")}
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-300 mb-1">
                Why this signal may be misleading:
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {scenario.deceptiveSignalExplanation}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300">
              <strong>Key Defense Rule:</strong> {scenario.keyTakeaway}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() =>
                  onAnalyzeSample(
                    scenario.messageText,
                    scenario.senderDisplay,
                    scenario.senderAddress
                  )
                }
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Through Deep Analysis Pipeline</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold flex items-center space-x-1.5"
              >
                <span>Next Scenario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
