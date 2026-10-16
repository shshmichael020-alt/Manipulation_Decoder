"use client";

import React, { useState } from "react";
import {
  AnalysisReport,
  FindingSeverity,
  RiskCategory,
} from "@/types/analyzer";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Brain,
  Sparkles,
  Link2,
  CheckCircle,
  Copy,
  Download,
  RotateCcw,
  Check,
  ExternalLink,
  ShieldX,
  Lock,
  Layers,
  Info,
  Clock,
  Key,
  Mail,
  FileCode,
  Crosshair,
  UserCheck,
  Eye,
  SlidersHorizontal,
  Share2,
} from "lucide-react";

interface AnalysisReportViewProps {
  report: AnalysisReport;
  onReset: () => void;
}

export function AnalysisReportView({
  report,
  onReset,
}: AnalysisReportViewProps) {
  const [viewMode, setViewMode] = useState<"protection" | "analyst">("protection");
  const [activeAnalystTab, setActiveAnalystTab] = useState<
    "overview" | "manipulation" | "email" | "urls" | "iocs" | "mitre" | "ai"
  >("overview");
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedIocs, setCopiedIocs] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);
  const [selectedHighlightText, setSelectedHighlightText] = useState<string | null>(null);

  const riskConfig: Record<
    RiskCategory,
    {
      label: string;
      bg: string;
      border: string;
      text: string;
      barColor: string;
      icon: React.ReactNode;
    }
  > = {
    LOW_RISK: {
      label: "Low Apparent Risk",
      bg: "bg-emerald-950/40",
      border: "border-emerald-500/40",
      text: "text-emerald-400",
      barColor: "bg-emerald-500",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    },
    MODERATE_RISK: {
      label: "Moderate Risk",
      bg: "bg-amber-950/40",
      border: "border-amber-500/40",
      text: "text-amber-400",
      barColor: "bg-amber-500",
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
    },
    HIGH_RISK: {
      label: "High Risk",
      bg: "bg-orange-950/40",
      border: "border-orange-500/40",
      text: "text-orange-400",
      barColor: "bg-orange-500",
      icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
    },
    CRITICAL_RISK: {
      label: "Critical Risk",
      bg: "bg-red-950/40",
      border: "border-red-500/40",
      text: "text-red-400",
      barColor: "bg-red-500",
      icon: <ShieldAlert className="w-6 h-6 text-red-400" />,
    },
  };

  const currentRisk = riskConfig[report.overallAssessment.category];

  const getSeverityPill = (severity: FindingSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-950/80 text-red-300 border-red-500/40";
      case "HIGH":
        return "bg-orange-950/80 text-orange-300 border-orange-500/40";
      case "MEDIUM":
        return "bg-amber-950/80 text-amber-300 border-amber-500/40";
      case "LOW":
        return "bg-cyan-950/80 text-cyan-300 border-cyan-500/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  // Copy Markdown Report
  const handleCopyReport = () => {
    const md = `
# The Manipulation Decoder — Security Analysis Report
**Report ID:** ${report.id}
**Timestamp:** ${report.timestamp}
**Overall Threat Score:** ${report.overallAssessment.score}/100 (${report.overallAssessment.category})
**Verdict:** ${report.overallAssessment.verdict}

## Executive Summary
${report.overallAssessment.summary}

## Key Metrics
- Threat Score: ${report.overallAssessment.score}/100
- Psychological Manipulation Index: ${report.overallAssessment.manipulationScore}/100
- Phishing Indicator Score: ${report.overallAssessment.phishingScore}/100
- AI-Writing Signal: ${report.aiWritingLikelihood.signalScore}/100 (${report.aiWritingLikelihood.verdictLabel})

## Psychological Manipulation Tactics (${report.manipulationFindings.length})
${
  report.manipulationFindings.length === 0
    ? "No manipulation patterns detected."
    : report.manipulationFindings
        .map(
          (m) =>
            `- [${m.severity}] **${m.tacticName}**\n  - Quoted: "${m.quotedText}"\n  - Risk: ${m.riskReason}\n  - Recommended: ${m.recommendedAction}`
        )
        .join("\n")
}

## Phishing & Social Engineering Indicators (${report.phishingFindings.findings.length})
${
  report.phishingFindings.findings.length === 0
    ? "No direct phishing indicators identified."
    : report.phishingFindings.findings
        .map(
          (p) =>
            `- [${p.severity}] **${p.title}**\n  - Evidence: "${p.evidence}"\n  - Guidance: ${p.defensiveGuidance}`
        )
        .join("\n")
}

## Extracted Defanged IOCs (${report.iocs.length})
${
  report.iocs.length === 0
    ? "None identified."
    : report.iocs.map((ioc) => `- [${ioc.type}] ${ioc.defanged}`).join("\n")
}

## MITRE ATT&CK Mappings
${
  report.mitreAttackMappings.length === 0
    ? "No MITRE techniques matched."
    : report.mitreAttackMappings
        .map((m) => `- ${m.techniqueId}: ${m.techniqueName} (${m.tactic})`)
        .join("\n")
}

## Immediate Defensive Actions
${report.recommendedActions.map((a) => `- [${a.priority}] ${a.action}: ${a.reason}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
  };

  // Copy Defanged IOCs
  const handleCopyIocs = () => {
    const text = report.iocs
      .map((ioc) => `${ioc.type.padEnd(8)}: ${ioc.defanged}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopiedIocs(true);
    setTimeout(() => setCopiedIocs(false), 2500);
  };

  // Copy Safe Reply Template
  const handleCopyReplyTemplate = () => {
    if (report.safeResponse.safeReplyTemplate) {
      navigator.clipboard.writeText(report.safeResponse.safeReplyTemplate);
      setCopiedReply(true);
      setTimeout(() => setCopiedReply(false), 2500);
    }
  };

  // Download JSON Report
  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manipulation-decoder-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download STIX 2.1 Bundle
  const handleDownloadSTIX = () => {
    if (!report.stix21Bundle) return;
    const blob = new Blob([JSON.stringify(report.stix21Bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manipulation-decoder-stix21-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-8 pb-16 space-y-6 animate-fadeIn">
      {/* Top Toolbar: View Mode Toggle & Export Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-card border border-surface-border shadow-lg">
        {/* Protection vs Analyst Mode Switch */}
        <div className="flex items-center space-x-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("protection")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === "protection"
                ? "bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Protection Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("analyst")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === "analyst"
                ? "bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Analyst Mode</span>
          </button>
        </div>

        {/* Export / Sharing Actions */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopyReport}
            className="px-2.5 py-1.5 rounded bg-surface border border-slate-700 hover:border-cyan-500/50 text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors"
          >
            {copiedMarkdown ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Copy Report</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className="px-2.5 py-1.5 rounded bg-surface border border-slate-700 hover:border-cyan-500/50 text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {report.stix21Bundle && (
            <button
              type="button"
              onClick={handleDownloadSTIX}
              className="px-2.5 py-1.5 rounded bg-surface border border-slate-700 hover:border-cyan-500/50 text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors"
              title="Download OASIS STIX 2.1 JSON Threat Bundle"
            >
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">STIX 2.1</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 rounded bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900 text-xs text-cyan-300 flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Hero Banner: Executive Verdict & Score */}
      <div
        className={`rounded-xl p-6 border ${currentRisk.border} ${currentRisk.bg} backdrop-blur-md shadow-xl relative overflow-hidden`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 shrink-0">
              {currentRisk.icon}
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <span
                  className={`text-xs font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${currentRisk.border} ${currentRisk.text}`}
                >
                  {currentRisk.label}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Mode: {report.mode.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {report.overallAssessment.verdict}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {report.overallAssessment.summary}
              </p>
            </div>
          </div>

          {/* Visual Risk Gauge Meter */}
          <div className="w-full md:w-52 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shrink-0 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Threat Score
            </div>
            <div className={`text-4xl font-extrabold font-mono ${currentRisk.text}`}>
              {report.overallAssessment.score}
              <span className="text-sm text-slate-500 font-normal">/100</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full ${currentRisk.barColor} transition-all duration-500`}
                style={{ width: `${Math.max(5, report.overallAssessment.score)}%` }}
              />
            </div>
            <div className="flex justify-between w-full text-[10px] text-slate-500 font-mono mt-1">
              <span>Low</span>
              <span>Mod</span>
              <span>High</span>
              <span>Crit</span>
            </div>
          </div>
        </div>

        {/* Primary Factors */}
        {report.overallAssessment.primaryFactors.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
              Strongest Contributing Signals:
            </div>
            <div className="flex flex-wrap gap-2">
              {report.overallAssessment.primaryFactors.map((factor, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700/60 text-slate-300 flex items-center space-x-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{factor}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PERSPECTIVE 1: PROTECTION MODE (Clean, simple, non-jargon, actionable)     */}
      {/* ========================================================================= */}
      {viewMode === "protection" && (
        <div className="space-y-6">
          {/* Why this message may be risky in plain English */}
          <div className="cyber-card rounded-xl p-5 border border-surface-border">
            <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Why This Message Requires Caution</span>
            </h3>

            {report.overallAssessment.score >= 25 ? (
              <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                <p>
                  Our security engine detected patterns commonly used by attackers to provoke fast, unverified decisions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {report.manipulationFindings.slice(0, 4).map((m) => (
                    <div key={m.id} className="p-3 rounded-lg bg-surface border border-slate-800">
                      <div className="font-semibold text-amber-300 text-xs mb-1">
                        {m.tacticName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {m.techniqueExplanation}
                      </div>
                    </div>
                  ))}
                  {report.phishingFindings.findings.slice(0, 2).map((p) => (
                    <div key={p.id} className="p-3 rounded-lg bg-surface border border-slate-800">
                      <div className="font-semibold text-red-300 text-xs mb-1">
                        {p.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {p.defensiveGuidance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300">
                No immediate high-risk manipulation tactics, credential requests, or deceptive links were found.
                Standard everyday communication precautions still apply.
              </p>
            )}
          </div>

          {/* What Should I Do Now? Checklist */}
          <div className="cyber-card rounded-xl p-5 border border-emerald-500/30 bg-emerald-950/10">
            <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>What Should I Do Now? (Defensive Checklist)</span>
            </h3>

            <div className="space-y-2">
              {report.safeResponse.immediateChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-surface border border-slate-800 flex items-start space-x-3 text-xs sm:text-sm text-slate-200"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Reply Assistant */}
          {report.safeResponse.safeReplyTemplate && (
            <div className="cyber-card rounded-xl p-5 border border-cyan-500/30 bg-cyan-950/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Safe Verification Reply Template</h3>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReplyTemplate}
                  className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 hover:bg-cyan-900 text-xs text-cyan-300 flex items-center space-x-1.5"
                >
                  {copiedReply ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Reply</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-2">
                If you must reply, use this non-committal response that refuses links and requests out-of-band verification without leaking personal details:
              </p>

              <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                {report.safeResponse.safeReplyTemplate}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PERSPECTIVE 2: ANALYST MODE (Deep technical investigation tabs)           */}
      {/* ========================================================================= */}
      {viewMode === "analyst" && (
        <div className="space-y-6">
          {/* Analyst Sub-Tabs Navigation */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {[
              { id: "overview", label: "Threat Radar & Metrics", icon: Crosshair },
              { id: "manipulation", label: `Manipulation (${report.manipulationFindings.length})`, icon: Brain },
              { id: "email", label: "Email Forensics", icon: Mail },
              { id: "urls", label: `URLs & Domains (${report.urlFindings.totalUrls})`, icon: Link2 },
              { id: "iocs", label: `IOCs & STIX (${report.iocs.length})`, icon: FileCode },
              { id: "mitre", label: `MITRE ATT&CK (${report.mitreAttackMappings.length})`, icon: Layers },
              { id: "ai", label: "AI Writing Signal", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveAnalystTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    activeAnalystTab === tab.id
                      ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & THREAT METRICS */}
          {activeAnalystTab === "overview" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-surface border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  Cyber Threat Index
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {report.overallAssessment.score}/100
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Compound multi-vector risk
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  Manipulation Index
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {report.overallAssessment.manipulationScore}/100
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {report.manipulationFindings.length} cognitive vectors
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  Phishing Signal Score
                </div>
                <div className="text-2xl font-bold font-mono text-red-400 mt-1">
                  {report.overallAssessment.phishingScore}/100
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {report.phishingFindings.findings.length} indicators flagged
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  AI Stylometric Signal
                </div>
                <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                  {report.aiWritingLikelihood.signalScore}/100
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {report.aiWritingLikelihood.signalStrength} (Decoupled)
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PSYCHOLOGICAL MANIPULATION MAP */}
          {activeAnalystTab === "manipulation" && (
            <div className="cyber-card rounded-xl p-5 border border-surface-border space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">
                  Psychological Influence Tactics & Cognitive Mapping
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {report.manipulationFindings.length} Tactics Identified
                </span>
              </div>

              {report.manipulationFindings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No psychological manipulation vectors observed.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {report.manipulationFindings.map((finding) => (
                    <div
                      key={finding.id}
                      className="p-4 rounded-xl bg-surface border border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getSeverityPill(
                              finding.severity
                            )}`}
                          >
                            {finding.severity}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {finding.category}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-200 mb-2">
                          {finding.tacticName}
                        </h4>

                        {/* Quoted Text */}
                        <div className="p-2.5 rounded bg-slate-950/80 border-l-2 border-cyan-400 text-xs font-mono text-cyan-300 mb-2 italic">
                          &ldquo;{finding.quotedText}&rdquo;
                        </div>

                        <p className="text-xs text-slate-400 mb-2">
                          <strong className="text-slate-300">Mechanism:</strong>{" "}
                          {finding.techniqueExplanation}
                        </p>

                        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 text-xs text-purple-300 mb-2">
                          <strong>Why this works on humans:</strong>{" "}
                          {finding.whyThisMightWork}
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-800 text-[11px] text-emerald-400">
                        <strong>Countermeasure:</strong> {finding.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EMAIL FORENSICS */}
          {activeAnalystTab === "email" && (
            <div className="cyber-card rounded-xl p-5 border border-surface-border space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">
                  Email Forensics & Authentication Deep-Dive
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {report.emailForensics?.isAvailable ? "Headers Parsed" : "No Raw Headers Provided"}
                </span>
              </div>

              {!report.emailForensics?.isAvailable ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Raw .EML or RFC 822 email headers were not provided for this scan.
                  Use &apos;Mode B: Email Forensics&apos; to inspect SPF, DKIM, DMARC, and routing hops.
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Authentication Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-surface border border-slate-800 text-center">
                      <div className="font-mono text-slate-400 text-[10px] uppercase">
                        SPF Record
                      </div>
                      <div
                        className={`text-base font-bold font-mono mt-1 ${
                          report.emailForensics.authResults.spf === "pass"
                            ? "text-emerald-400"
                            : report.emailForensics.authResults.spf === "fail"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      >
                        {report.emailForensics.authResults.spf.toUpperCase()}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-surface border border-slate-800 text-center">
                      <div className="font-mono text-slate-400 text-[10px] uppercase">
                        DKIM Signature
                      </div>
                      <div
                        className={`text-base font-bold font-mono mt-1 ${
                          report.emailForensics.authResults.dkim === "pass"
                            ? "text-emerald-400"
                            : report.emailForensics.authResults.dkim === "fail"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      >
                        {report.emailForensics.authResults.dkim.toUpperCase()}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-surface border border-slate-800 text-center">
                      <div className="font-mono text-slate-400 text-[10px] uppercase">
                        DMARC Policy
                      </div>
                      <div
                        className={`text-base font-bold font-mono mt-1 ${
                          report.emailForensics.authResults.dmarc === "pass"
                            ? "text-emerald-400"
                            : report.emailForensics.authResults.dmarc === "fail"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      >
                        {report.emailForensics.authResults.dmarc.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Envelope Headers */}
                  <div className="p-3 rounded-lg bg-surface border border-slate-800 font-mono text-[11px] space-y-1">
                    <div>
                      <strong className="text-slate-400">From:</strong>{" "}
                      <span className="text-slate-200">{report.emailForensics.headers.from || "None"}</span>
                    </div>
                    <div>
                      <strong className="text-slate-400">Reply-To:</strong>{" "}
                      <span className="text-slate-200">{report.emailForensics.headers.replyTo || "Same as From"}</span>
                    </div>
                    <div>
                      <strong className="text-slate-400">Return-Path:</strong>{" "}
                      <span className="text-slate-200">{report.emailForensics.headers.returnPath || "None"}</span>
                    </div>
                    <div>
                      <strong className="text-slate-400">Subject:</strong>{" "}
                      <span className="text-slate-200">{report.emailForensics.headers.subject || "None"}</span>
                    </div>
                  </div>

                  {/* Header Anomalies */}
                  {report.emailForensics.headerAnomalies.length > 0 && (
                    <div>
                      <div className="font-bold text-red-300 mb-1.5">Header Discrepancies Flagged:</div>
                      <div className="space-y-1">
                        {report.emailForensics.headerAnomalies.map((anom, i) => (
                          <div key={i} className="p-2 rounded bg-red-950/40 border border-red-500/30 text-red-300 flex items-center space-x-2">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{anom}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachment metadata */}
                  {report.emailForensics.attachments.length > 0 && (
                    <div>
                      <div className="font-bold text-slate-300 mb-1.5">MIME Attachments:</div>
                      <div className="space-y-2">
                        {report.emailForensics.attachments.map((att, i) => (
                          <div key={i} className="p-3 rounded-lg bg-surface border border-slate-800 flex flex-col sm:flex-row justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-200">{att.filename}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                SHA-256: {att.sha256}
                              </div>
                            </div>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border self-start ${att.isSuspiciousExtension ? "bg-red-950 text-red-300 border-red-500/40" : "bg-slate-800 text-slate-300"}`}>
                              {att.mimeType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: URL & DOMAIN INTELLIGENCE */}
          {activeAnalystTab === "urls" && (
            <div className="cyber-card rounded-xl p-5 border border-surface-border space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">
                  Safe URL & Destination Intelligence
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {report.urlFindings.totalUrls} Links Evaluated
                </span>
              </div>

              {report.urlFindings.extractedUrls.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No URLs were detected in the analyzed message.
                </div>
              ) : (
                <div className="space-y-3">
                  {report.urlFindings.extractedUrls.map((u, i) => (
                    <div key={i} className="p-3.5 rounded-lg bg-surface border border-slate-800 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="font-mono text-cyan-300 break-all">
                          {u.rawUrl}
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${u.isHttps ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30" : "bg-red-950 text-red-300 border border-red-500/30"}`}>
                            {u.isHttps ? "HTTPS" : "Plain HTTP"}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                            Risk: {u.riskScore}/100
                          </span>
                        </div>
                      </div>

                      <div className="font-mono text-[11px] text-slate-400 mb-2">
                        Defanged: <span className="text-slate-300">{u.defangedUrl}</span>
                      </div>

                      {u.flags.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {u.flags.map((flag, fIdx) => (
                            <div key={fIdx} className="text-amber-300 text-[11px] flex items-center space-x-1.5">
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{flag}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: IOCS & STIX 2.1 */}
          {activeAnalystTab === "iocs" && (
            <div className="cyber-card rounded-xl p-5 border border-surface-border space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">Indicators of Compromise (Defanged)</h3>
                  <button
                    type="button"
                    onClick={handleCopyIocs}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center space-x-1"
                  >
                    {copiedIocs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIocs ? "Copied" : "Copy All"}</span>
                  </button>
                </div>

                {report.stix21Bundle && (
                  <button
                    type="button"
                    onClick={handleDownloadSTIX}
                    className="px-2.5 py-1 rounded bg-purple-950 border border-purple-500/40 text-purple-300 text-xs flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download STIX 2.1 Bundle</span>
                  </button>
                )}
              </div>

              {report.iocs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No forensic indicators of compromise identified.
                </div>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  {report.iocs.map((ioc) => (
                    <div
                      key={ioc.id}
                      className="p-2.5 rounded bg-surface border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 uppercase">
                          {ioc.type}
                        </span>
                        <span className="text-slate-200 break-all">{ioc.defanged}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0">{ioc.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MITRE ATT&CK & THREAT INTEL */}
          {activeAnalystTab === "mitre" && (
            <div className="cyber-card rounded-xl p-5 border border-surface-border space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">MITRE ATT&CK Enterprise Matrix Mapping</h3>
                <span className="text-xs font-mono text-slate-400">
                  {report.mitreAttackMappings.length} Techniques Mapped
                </span>
              </div>

              {report.mitreAttackMappings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No specific MITRE ATT&CK attack patterns matched.
                </div>
              ) : (
                <div className="space-y-3">
                  {report.mitreAttackMappings.map((m) => (
                    <div key={m.techniqueId} className="p-4 rounded-xl bg-surface border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                            {m.techniqueId}
                          </span>
                          <span className="font-bold text-slate-200 text-sm">
                            {m.techniqueName}
                          </span>
                        </div>
                        <a
                          href={m.referenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-cyan-400 flex items-center space-x-1"
                        >
                          <span>MITRE Doc</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="text-slate-400">
                        <strong className="text-slate-300">Tactic:</strong> {m.tactic}
                      </div>

                      <div className="p-2 rounded bg-slate-950/60 font-mono text-[11px] text-slate-400">
                        Observed Evidence: {m.observedEvidence}
                      </div>

                      <div className="text-emerald-400 text-[11px]">
                        <strong>Mitigation:</strong> {m.defensiveMitigation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Threat Intel Provider Status */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Threat Intelligence Provider Adapters:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {report.threatIntelligence.map((ti, i) => (
                    <div key={i} className="p-2.5 rounded bg-surface border border-slate-800">
                      <div className="font-semibold text-slate-300">{ti.providerName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{ti.details}</div>
                      <span className={`text-[10px] font-mono mt-1.5 inline-block px-1.5 py-0.5 rounded ${ti.status === "ONLINE_ACTIVE" ? "bg-emerald-950 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>
                        {ti.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AI-WRITING SIGNAL */}
          {activeAnalystTab === "ai" && (
            <div className="cyber-card rounded-xl p-5 border border-purple-500/30 bg-purple-950/10 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">
                    AI-Writing Likelihood — Experimental Stylometrics
                  </h3>
                </div>
                <span className="text-xs font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
                  {report.aiWritingLikelihood.verdictLabel}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded bg-surface border border-slate-800 text-xs">
                  <div className="text-[10px] text-slate-400 font-mono">Sentence Uniformity</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {report.aiWritingLikelihood.linguisticMetrics.uniformityIndex}/100
                  </div>
                </div>
                <div className="p-3 rounded bg-surface border border-slate-800 text-xs">
                  <div className="text-[10px] text-slate-400 font-mono">Lexical Diversity (TTR)</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {report.aiWritingLikelihood.linguisticMetrics.lexicalDiversityTTR}
                  </div>
                </div>
                <div className="p-3 rounded bg-surface border border-slate-800 text-xs">
                  <div className="text-[10px] text-slate-400 font-mono">Formal Connectors</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {report.aiWritingLikelihood.linguisticMetrics.formulaicTransitionCount}
                  </div>
                </div>
                <div className="p-3 rounded bg-surface border border-slate-800 text-xs">
                  <div className="text-[10px] text-slate-400 font-mono">AI Signal Strength</div>
                  <div className="text-lg font-bold text-purple-400 mt-1">
                    {report.aiWritingLikelihood.signalScore}/100
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {report.aiWritingLikelihood.detectedCharacteristics.map((c) => (
                  <div key={c.id} className="p-3 rounded bg-surface border border-slate-800 text-xs text-slate-300">
                    <div className="font-semibold text-purple-300 mb-0.5">{c.title}</div>
                    <p className="text-slate-400">{c.description}</p>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Disclaimer: {report.aiWritingLikelihood.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
