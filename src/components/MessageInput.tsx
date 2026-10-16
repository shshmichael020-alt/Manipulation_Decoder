"use client";

import React, { useState } from "react";
import {
  Send,
  Trash2,
  SlidersHorizontal,
  ShieldAlert,
  Loader2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DEMO_SCENARIOS, DemoScenario } from "@/data/demo-messages";
import { AnalyzeRequest } from "@/types/analyzer";

interface MessageInputProps {
  onAnalyze: (payload: AnalyzeRequest) => Promise<void>;
  isLoading: boolean;
}

export function MessageInput({ onAnalyze, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [contextType, setContextType] = useState<
    "email" | "sms" | "chat" | "social" | "payment" | "other"
  >("email");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const characterCount = message.length;
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;
  const maxCharacters = 10000;

  const handleClear = () => {
    setMessage("");
    setSenderName("");
    setSenderAddress("");
    setValidationError(null);
  };

  const handleLoadDemo = (demo: DemoScenario) => {
    setMessage(demo.message);
    setSenderName(demo.senderName || "");
    setSenderAddress(demo.senderAddress || "");
    setContextType(demo.contextType);
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setValidationError("Please enter or paste a message to analyze.");
      return;
    }
    if (message.length > maxCharacters) {
      setValidationError(
        `Message exceeds ${maxCharacters.toLocaleString()} characters limit.`
      );
      return;
    }

    setValidationError(null);
    await onAnalyze({
      mode: "message",
      message,
      senderName: senderName.trim() || undefined,
      senderAddress: senderAddress.trim() || undefined,
      contextType,
      userAgreedToScan: true,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      {/* Demo quick-select pills */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Curated Test Scenarios</span>
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Processed through same live engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {DEMO_SCENARIOS.map((demo) => {
            const badgeClasses = {
              red: "bg-red-950/70 border-red-500/40 text-red-300",
              amber: "bg-amber-950/70 border-amber-500/40 text-amber-300",
              green: "bg-emerald-950/70 border-emerald-500/40 text-emerald-300",
              cyan: "bg-cyan-950/70 border-cyan-500/40 text-cyan-300",
            }[demo.badgeColor];

            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleLoadDemo(demo)}
                className="group p-2.5 rounded-lg bg-surface-card border border-surface-border hover:border-cyan-500/50 hover:bg-surface-hover text-left transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeClasses}`}
                    >
                      {demo.badge}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                    {demo.title}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {demo.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Form Card */}
      <form
        onSubmit={handleSubmit}
        className="cyber-card rounded-xl p-5 border border-surface-border shadow-2xl relative overflow-hidden"
      >
        {/* Header / instructions */}
        <div className="flex items-center justify-between mb-3">
          <label
            htmlFor="message-input"
            className="text-sm font-semibold text-slate-200 flex items-center space-x-2"
          >
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Target Message Content</span>
          </label>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center space-x-1 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvanced ? "Hide Sender Context" : "Add Sender Details (Optional)"}</span>
            {showAdvanced ? (
              <ChevronUp className="w-3 h-3 ml-0.5" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-0.5" />
            )}
          </button>
        </div>

        {/* Optional Sender Details */}
        {showAdvanced && (
          <div className="mb-4 p-3.5 rounded-lg bg-slate-900/80 border border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Claimed Sender / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Bank of America, IT Desk, CEO"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                maxLength={100}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-surface border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Sender Email / Phone / Handle
              </label>
              <input
                type="text"
                placeholder="e.g. support@bank-verify.xyz"
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                maxLength={150}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-surface border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Channel Context
              </label>
              <select
                value={contextType}
                onChange={(e) => setContextType(e.target.value as any)}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-surface border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="email">Email Message</option>
                <option value="sms">SMS / Text Message</option>
                <option value="chat">Slack / Teams / WhatsApp</option>
                <option value="payment">Payment / Invoice Request</option>
                <option value="social">Social Media DM</option>
                <option value="other">Other / Unknown</option>
              </select>
            </div>
          </div>
        )}

        {/* Text Area */}
        <div className="relative">
          <textarea
            id="message-input"
            rows={7}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Paste suspicious email, SMS, notification, or message here...
e.g. 'URGENT: Your account has been suspended. Click here to confirm your 6-digit OTP code before access is permanently revoked.'"
            className="w-full p-3.5 rounded-lg bg-surface border border-surface-border text-slate-100 placeholder-slate-500 text-sm font-sans focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all resize-y min-h-[140px]"
          />

          {/* Counters & Limits */}
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-3">
              <span>{wordCount} words</span>
              <span>•</span>
              <span
                className={
                  characterCount > maxCharacters * 0.9
                    ? "text-amber-400 font-bold"
                    : ""
                }
              >
                {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()} chars
              </span>
            </div>

            <div className="flex items-center space-x-1 text-[11px] text-slate-500">
              <Info className="w-3 h-3 text-cyan-400" />
              <span>In-memory analysis • No log storage</span>
            </div>
          </div>
        </div>

        {/* Validation error message */}
        {validationError && (
          <div className="mt-3 p-2.5 rounded bg-red-950/80 border border-red-500/40 text-xs text-red-300 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || (!message && !senderName && !senderAddress)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Input</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Running Cybersecurity & AI Engine...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>Analyze Message Now</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
