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
  ExternalLink,
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-950 border-l border-surface-border h-full flex flex-col p-5 shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Local Investigation Cases</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Opt-in Toggle Banner */}
        <div className="my-4 p-3 rounded-lg bg-surface border border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Browser-Only Storage (Opt-In)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={optIn}
                onChange={handleToggleOptIn}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
            When enabled, minimal summary metadata is saved in your browser&apos;s LocalStorage.
            Zero telemetry or message content is ever retained by our servers.
          </p>
        </div>

        {/* Case List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {!optIn ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-xs text-slate-500">
              <Lock className="w-8 h-8 text-slate-700 mb-2" />
              <span>Case history is currently disabled. Toggle above to save local summaries.</span>
            </div>
          ) : cases.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-xs text-slate-500">
              <Clock className="w-8 h-8 text-slate-700 mb-2" />
              <span>No recent cases saved. Run an analysis to build local history.</span>
            </div>
          ) : (
            cases.map((c) => {
              const badgeClass =
                c.score >= 75
                  ? "bg-red-950 text-red-300 border-red-500/40"
                  : c.score >= 50
                  ? "bg-orange-950 text-orange-300 border-orange-500/40"
                  : c.score >= 25
                  ? "bg-amber-950 text-amber-300 border-amber-500/40"
                  : "bg-emerald-950 text-emerald-300 border-emerald-500/40";

              return (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-surface border border-slate-800 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeClass}`}>
                        Score: {c.score}/100
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-200 line-clamp-1 mb-1">
                      {c.verdict}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 italic mb-2">
                      &ldquo;{c.preview}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                    <span>Tactics: {c.manipulationCount} | URLs: {c.urlCount}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-1 text-slate-500 hover:text-red-400"
                      title="Delete case"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {optIn && cases.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">{cases.length} cases stored</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-950 text-xs flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
