"use client";

import React, { useState, useEffect } from "react";
import {
  getSavedCases,
  getHistoryOptIn,
  setHistoryOptIn,
  deleteCaseFromHistory,
  clearCaseHistory,
  SavedCaseSummary,
} from "@/lib/storage/case-history";
import {
  X,
  Trash2,
  Lock,
  Clock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface CaseHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CaseHistoryDrawer({ isOpen, onClose }: CaseHistoryDrawerProps) {
  const [cases, setCases] = useState<SavedCaseSummary[]>([]);
  const [optIn, setOptIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOptIn(getHistoryOptIn());
      setCases(getSavedCases());
    }
  }, [isOpen]);

  const handleToggleOptIn = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setOptIn(val);
    setHistoryOptIn(val);
    if (!val) {
      setCases([]);
    } else {
      setCases(getSavedCases());
    }
  };

  const handleDelete = (id: string) => {
    deleteCaseFromHistory(id);
    setCases(getSavedCases());
  };

  const handleClearAll = () => {
    clearCaseHistory();
    setCases([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-surface-container-lowest border-l border-outline-variant/30 h-full flex flex-col p-5 shadow-2xl text-on-surface">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-on-surface font-headline-sm uppercase tracking-wide">
              Local Case History
            </h3>
            <span className="font-telemetry-pill text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono">
              {cases.length} STORED
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Opt-in Toggle Banner */}
        <div className="my-4 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-on-surface font-semibold">
              <Lock className="w-3.5 h-3.5 text-secondary" />
              <span>Browser-Only Storage (Opt-In)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={optIn}
                onChange={handleToggleOptIn}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
            When enabled, minimal summary metadata is saved in your browser&apos;s LocalStorage.
            Zero telemetry or message content is ever retained by our servers.
          </p>
        </div>

        {/* Case List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {cases.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/60 flex flex-col gap-2 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-code-ioc text-[11px] text-primary font-mono font-bold">
                  CASE #{c.id.slice(0, 12)}
                </span>
                <span
                  className={`font-telemetry-pill text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    c.category === "CRITICAL_RISK"
                      ? "bg-error-container/40 text-error"
                      : c.category === "HIGH_RISK"
                      ? "bg-orange-950/40 text-orange-400"
                      : c.category === "MODERATE_RISK"
                      ? "bg-tertiary-container/30 text-tertiary"
                      : "bg-secondary-container/20 text-secondary"
                  }`}
                >
                  {c.score}/100
                </span>
              </div>

              <p className="text-xs text-on-surface line-clamp-2 italic">
                &ldquo;{c.preview}&rdquo;
              </p>

              <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-code-ioc pt-1 border-t border-outline-variant/20">
                <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <span>{c.manipulationCount} Tactics</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-on-surface-variant hover:text-error transition-colors"
                    title="Delete case record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {cases.length === 0 && (
            <div className="h-48 flex flex-col items-center justify-center text-center text-on-surface-variant text-xs gap-2">
              <FileText className="w-8 h-8 text-on-surface-variant/40" />
              <span>No local case records saved.</span>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cases.length > 0 && (
          <div className="pt-3 border-t border-outline-variant/30 flex justify-end">
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-error-container/30 text-on-surface-variant hover:text-error text-xs flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
