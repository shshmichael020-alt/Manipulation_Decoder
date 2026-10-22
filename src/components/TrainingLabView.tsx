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
  Play,
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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-6 flex flex-col gap-4 text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-outline-variant/30 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-tertiary/30 flex items-center justify-center text-tertiary shadow-[0_0_12px_rgba(244,187,100,0.2)]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-lg text-lg sm:text-xl font-bold text-on-surface">
                Interactive Cognitive Training Lab
              </h2>
              <span className="font-telemetry-pill text-[10px] font-mono px-2 py-0.5 rounded bg-tertiary-container/30 border border-tertiary/30 text-tertiary font-bold uppercase">
                {TRAINING_SCENARIOS.length} SCENARIOS
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Train your psychological defense instincts on realistic social-engineering simulations before running automated deconstruction.
            </p>
          </div>
        </div>

        {/* Score indicator */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs font-mono text-on-surface">
            Score: <strong className="text-primary font-bold tnum">{score.correct}</strong> / {score.total}
          </div>
          <button
            type="button"
            onClick={handleResetLab}
            className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface transition-colors"
            title="Reset training lab score"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scenario Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        {TRAINING_SCENARIOS.map((sc, idx) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => {
              setSelectedScenarioIndex(idx);
              setUserGuess(null);
              setRevealed(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              selectedScenarioIndex === idx
                ? "bg-primary text-on-primary font-bold border-primary shadow-[0_0_10px_rgba(143,240,255,0.3)]"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface border-outline-variant/30"
            }`}
          >
            Scenario 0{idx + 1}: {sc.title.slice(0, 24)}...
          </button>
        ))}
      </div>

      {/* Main Scenario Flashcard */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 sm:p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/20">
          <div>
            <span className="font-telemetry-pill text-[10px] text-tertiary uppercase font-mono font-bold">
              SCENARIO {selectedScenarioIndex + 1} OF {TRAINING_SCENARIOS.length} • {scenario.category}
            </span>
            <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface mt-0.5">
              {scenario.title}
            </h3>
          </div>
          <span className="font-telemetry-pill text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono uppercase">
            CHANNEL: {scenario.contextType}
          </span>
        </div>

        {/* Simulated Message Well */}
        <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-on-surface-variant font-code-ioc pb-2 border-b border-outline-variant/20 gap-1">
            <span><strong>From:</strong> &quot;{scenario.senderDisplay}&quot; &lt;{scenario.senderAddress}&gt;</span>
            <span className="font-mono text-[11px] uppercase">Format: {scenario.contextType}</span>
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/20 font-body-base text-sm text-on-surface whitespace-pre-wrap leading-relaxed select-text">
            {scenario.messageText}
          </div>
        </div>

        {/* User Guess Prompt */}
        {!revealed ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-on-surface font-semibold flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-tertiary" />
              What is your defensive verdict on this communication?
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleGuess("SAFE_BENIGN")}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-surface-container-high hover:bg-secondary/20 hover:text-secondary border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span>Legitimate & Safe</span>
              </button>

              <button
                type="button"
                onClick={() => handleGuess("DANGEROUS_PHISHING")}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-error-container hover:bg-error/80 border border-error/40 text-xs font-bold text-on-error-container flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Malicious Manipulation</span>
              </button>
            </div>
          </div>
        ) : (
          /* Revealed Analysis Breakdown */
          <div className="flex flex-col gap-3 pt-2">
            <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
              userGuess === scenario.correctVerdict
                ? "bg-secondary-container/20 border-secondary/40 text-on-surface"
                : "bg-error-container/30 border-error/40 text-on-surface"
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-sm font-bold flex items-center gap-2">
                  {userGuess === scenario.correctVerdict ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-secondary" />
                      <span className="text-secondary">Correct Assessment!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-error" />
                      <span className="text-error">Vulnerability Triggered!</span>
                    </>
                  )}
                </span>
                <span className="font-telemetry-pill text-[10px] px-2 py-0.5 rounded bg-surface-container-high font-mono uppercase">
                  TRUE STATUS: {scenario.correctVerdict.replace("_", " ")}
                </span>
              </div>

              <p className="text-xs text-on-surface leading-relaxed">
                {scenario.deceptiveSignalExplanation}
              </p>

              <div className="mt-2 p-2.5 rounded-lg bg-surface-container-high/80 border border-outline-variant/20 flex flex-col gap-1">
                <span className="font-telemetry-pill text-[10px] uppercase text-primary font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Key Cognitive Takeaway:
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {scenario.keyTakeaway}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => onAnalyzeSample(scenario.messageText, scenario.senderDisplay, scenario.senderAddress)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline-sm text-xs font-bold shadow-md hover:bg-primary-container transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Send to Studio for Full Forensics</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline-sm text-on-surface transition-all"
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
