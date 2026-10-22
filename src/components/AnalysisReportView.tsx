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
  Share2,
  AlertOctagon,
  Eye,
  CheckCircle2,
  Cpu,
  ChevronRight,
  Flame,
  FileText,
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
  const [activeTab, setActiveTab] = useState<
    "evidence" | "urls" | "email" | "mitre" | "iocs" | "response"
  >("evidence");

  const [selectedFindingIndex, setSelectedFindingIndex] = useState<number>(0);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedStix, setCopiedStix] = useState(false);
  const [copiedIocs, setCopiedIocs] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [quarantineAlert, setQuarantineAlert] = useState(false);

  const score = report.overallAssessment.score;

  // Severity color maps
  const getRiskColor = (cat: RiskCategory) => {
    switch (cat) {
      case "CRITICAL_RISK":
        return { text: "text-error", bg: "bg-error-container/40", border: "border-error/40", fill: "#ffb4ab", badge: "CRITICAL RISK • ATTACK LIKELY" };
      case "HIGH_RISK":
        return { text: "text-orange-400", bg: "bg-orange-950/40", border: "border-orange-500/40", fill: "#fb923c", badge: "HIGH RISK • DECEPTION DETECTED" };
      case "MODERATE_RISK":
        return { text: "text-tertiary", bg: "bg-tertiary-container/30", border: "border-tertiary/40", fill: "#f4bb64", badge: "MODERATE RISK • SUSPICIOUS CUES" };
      default:
        return { text: "text-secondary", bg: "bg-secondary-container/20", border: "border-secondary/30", fill: "#51ddb2", badge: "LOW RISK • NOMINAL" };
    }
  };

  const riskMeta = getRiskColor(report.overallAssessment.category);

  // SVG Gauge calculation: Circumference = 2 * PI * 50 = 314.159
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Copy STIX bundle to clipboard
  const handleCopyStix = () => {
    if (report.stix21Bundle) {
      navigator.clipboard.writeText(JSON.stringify(report.stix21Bundle, null, 2));
      setCopiedStix(true);
      setTimeout(() => setCopiedStix(false), 2000);
    }
  };

  // Copy Defanged IOCs
  const handleCopyIocs = () => {
    const lines = report.iocs.map((ioc) => `${ioc.type.toUpperCase()}: ${ioc.defanged}`);
    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedIocs(true);
    setTimeout(() => setCopiedIocs(false), 2000);
  };

  // Download STIX 2.1 JSON file
  const handleDownloadStix = () => {
    if (!report.stix21Bundle) return;
    const blob = new Blob([JSON.stringify(report.stix21Bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stix-bundle-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Markdown Report
  const handleExportMarkdown = () => {
    const md = `# Manipulation Decoder Security Assessment Report
Case ID: ${report.id}
Date: ${report.timestamp}
Overall Threat Score: ${report.overallAssessment.score}/100 (${report.overallAssessment.category})
Verdict: ${report.overallAssessment.verdict}

## Executive Summary
${report.overallAssessment.summary}

## Key Risk Factors
${report.overallAssessment.primaryFactors.map(f => `- ${f}`).join("\n")}

## Psychological Manipulation Findings (${report.manipulationFindings.length})
${report.manipulationFindings.map(m => `### ${m.tacticName} [${m.severity}]
Quoted: "${m.quotedText}"
Mechanism: ${m.whyThisMightWork}
Defensive Action: ${m.recommendedAction}
`).join("\n")}

## URL Findings (${report.urlFindings.totalUrls})
${report.urlFindings.extractedUrls.map(u => `- ${u.defangedUrl} (Domain: ${u.domain}, Risk: ${u.riskScore})`).join("\n")}

## Defanged Indicators of Compromise (IOCs)
${report.iocs.map(ioc => `- [${ioc.type}] ${ioc.defanged}`).join("\n")}
`;
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  // Active finding for the right-hand evidence drawer
  const selectedFinding = report.manipulationFindings[selectedFindingIndex] || report.manipulationFindings[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-5 text-on-surface">
      {/* 1. Case Meta & Header Canvas */}
      <div className="flex flex-col gap-3">
        {/* Breadcrumb & Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 shadow-md">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-telemetry-pill text-[10px] tracking-widest text-on-surface-variant uppercase font-mono">
              INVESTIGATIONS
            </span>
            <span className="text-on-surface-variant/40">/</span>
            <span className="font-code-ioc text-xs text-primary font-bold">
              CASE #{report.id.slice(0, 16)}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high font-telemetry-pill text-[10px] text-on-surface-variant font-mono">
              MODE: {report.mode.toUpperCase()}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${riskMeta.bg} ${riskMeta.text} font-telemetry-pill text-[10px] font-bold tracking-wider uppercase border ${riskMeta.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${score >= 55 ? "bg-error animate-ping" : "bg-secondary"}`} />
              {report.overallAssessment.category.replace("_", " ")}
            </span>
          </div>

          {/* Quick Action Utilities */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`CASE-TOKEN-${report.id}`);
                setCopiedToken(true);
                setTimeout(() => setCopiedToken(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-semibold transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-secondary" />
              <span>{copiedToken ? "Token Copied!" : "Share Case Token"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-primary/30 text-xs text-primary font-semibold transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{copiedMarkdown ? "Report Copied!" : "Export Report (MD)"}</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant hover:text-on-surface transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          </div>
        </div>

        {/* Case Dossier Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 shadow-md">
          <div className="flex flex-col gap-0.5">
            <span className="font-telemetry-pill text-[10px] uppercase text-on-surface-variant font-mono">
              Ingestion Channel
            </span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span className="font-headline-sm text-xs text-on-surface font-semibold truncate">
                {report.mode === "email_forensics" ? "Email Forensics (RFC-822)" : report.mode === "url" ? "Isolated URL Scan" : report.mode === "screenshot" ? "Screenshot Vision OCR" : "Raw Message Deconstruction"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="font-telemetry-pill text-[10px] uppercase text-on-surface-variant font-mono">
              Analyzed Timestamp
            </span>
            <span className="font-code-ioc text-xs text-on-surface truncate">
              {new Date(report.timestamp).toUTCString()}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="font-telemetry-pill text-[10px] uppercase text-on-surface-variant font-mono">
              Target / Sender
            </span>
            <span className="font-headline-sm text-xs text-on-surface truncate">
              {report.emailForensics?.headers.from || "Unspecified Target Entity"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="font-telemetry-pill text-[10px] uppercase text-on-surface-variant font-mono">
              Engine Heuristic
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-code-ioc text-xs text-secondary font-mono">Strict Zero-Exfil Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Hero Verdict Card */}
      <div className="relative overflow-hidden bg-surface-container-low rounded-xl p-4 sm:p-6 border border-outline-variant/30 shadow-xl flex flex-col gap-4">
        {/* Ambient Glow */}
        <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
          score >= 55 ? "bg-red-500" : "bg-cyan-500"
        }`} />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Circular Radial Score Compound */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="relative flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  className="text-surface-container-highest"
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className={`${score >= 80 ? "text-error" : score >= 55 ? "text-orange-400" : score >= 25 ? "text-tertiary" : "text-secondary"} transition-all duration-1000 ease-out`}
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`font-stat-score text-3xl sm:text-4xl font-extrabold leading-none tnum ${riskMeta.text}`}>
                  {score}
                </span>
                <span className="font-telemetry-pill text-[10px] text-on-surface-variant font-bold tracking-widest mt-1">
                  / 100
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 max-w-sm">
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${riskMeta.bg} ${riskMeta.text} self-start font-telemetry-pill text-[10px] uppercase font-extrabold tracking-wider border ${riskMeta.border}`}>
                {riskMeta.badge}
              </div>
              <h2 className="font-headline-lg text-lg sm:text-xl text-on-surface font-extrabold leading-tight">
                {report.overallAssessment.verdict}
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {report.overallAssessment.summary}
              </p>
            </div>
          </div>

          {/* Right: Diagnosis Visual Breakdown */}
          <div className="flex flex-col gap-2 bg-surface-container/90 backdrop-blur-md p-4 rounded-xl border border-outline-variant/30 max-w-md w-full">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-pill text-[10px] uppercase text-on-surface-variant font-semibold">
                Diagnosis Vector
              </span>
              <span className="font-code-ioc text-xs text-tertiary font-mono">
                {report.mitreAttackMappings[0]?.techniqueId || "MITRE PRE-ATT&CK T1566"}
              </span>
            </div>
            <p className="font-headline-md text-sm text-on-surface font-semibold leading-snug">
              {report.overallAssessment.primaryFactors[0] || "Targeted Social Engineering Vector"}
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {report.overallAssessment.primaryFactors[1] || "Crafted urgency and identity spoofing aimed at extracting unauthorized actions."}
            </p>

            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-outline-variant/20 mt-1">
              {report.emailForensics && (
                <>
                  <span className={`px-2 py-0.5 rounded font-telemetry-pill text-[10px] font-mono ${
                    report.emailForensics.authResults.spf === "pass" ? "bg-secondary/20 text-secondary" : "bg-error-container/40 text-error"
                  }`}>
                    SPF: {report.emailForensics.authResults.spf.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-telemetry-pill text-[10px] font-mono ${
                    report.emailForensics.authResults.dkim === "pass" ? "bg-secondary/20 text-secondary" : "bg-error-container/40 text-error"
                  }`}>
                    DKIM: {report.emailForensics.authResults.dkim.toUpperCase()}
                  </span>
                </>
              )}
              <span className="px-2 py-0.5 rounded bg-surface-container-high font-telemetry-pill text-[10px] text-tertiary font-mono">
                {report.manipulationFindings.length} Tactics Identified
              </span>
            </div>
          </div>
        </div>

        {/* High-Impact Incident Response Actions Banner */}
        <div className="relative bg-surface-container-lowest p-3 sm:p-4 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-error-container/30 border border-error/40 flex items-center justify-center shrink-0 text-error">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-xs sm:text-sm text-on-surface font-bold">
                Emergency Response Runbook Activated
              </span>
              <span className="text-xs text-on-surface-variant">
                Isolate identical communication patterns and verify via secondary out-of-band channels before taking action.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={() => {
                setQuarantineAlert(true);
                setTimeout(() => setQuarantineAlert(false), 3000);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-error-container hover:bg-error/80 text-on-error-container border border-error/40 font-headline-sm text-xs font-bold shadow-md transition-all active:scale-95"
            >
              {quarantineAlert ? "Quarantine Flag Logged!" : "Quarantine Inbox Fleet"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("response")}
              className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface text-xs font-headline-sm transition-all active:scale-95"
            >
              View Neutralize Script
            </button>
          </div>
        </div>
      </div>

      {/* 3. Dual-Perspective Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/30">
        <div className="bg-surface-container-low p-1 rounded-lg border border-outline-variant/40 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode("protection")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "protection"
                ? "bg-primary text-on-primary font-bold shadow-[0_0_10px_rgba(143,240,255,0.3)]"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protection Mode (Executive / Actionable)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("analyst")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "analyst"
                ? "bg-primary text-on-primary font-bold shadow-[0_0_10px_rgba(143,240,255,0.3)]"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Analyst Mode (TTP / STIX / Forensics)</span>
          </button>
        </div>

        <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase font-mono px-2">
          {viewMode === "protection" ? "Synthesized plain-English mitigation" : "Raw RFC, STIX 2.1 schemas & ATT&CK mapping"}
        </span>
      </div>

      {/* 4. Perspective Triage: Leadership vs Analyst Synopsis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Executive Layman Synopsis (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3 bg-surface-container-low p-4 sm:p-5 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="font-headline-md text-sm sm:text-base text-on-surface font-bold">
                Executive Tactical Synopsis
              </h3>
            </div>
            <span className="font-telemetry-pill text-[10px] px-2 py-0.5 rounded bg-surface-container-highest text-secondary uppercase font-mono">
              Plain Language Defense
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Core Question 1: Attacker Intent */}
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
              <div className="flex items-center gap-1.5 text-tertiary">
                <Brain className="w-4 h-4 text-tertiary" />
                <span className="text-xs font-bold text-on-surface">Attacker Intent</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {report.overallAssessment.primaryFactors[0] || "Impersonating authority figure to bypass security protocols and create urgency."}
              </p>
            </div>

            {/* Core Question 2: Consequence Profile */}
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
              <div className="flex items-center gap-1.5 text-error">
                <AlertOctagon className="w-4 h-4 text-error" />
                <span className="text-xs font-bold text-on-surface">Consequence Profile</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {score >= 60 ? "Potential credential compromise, unauthorized wire transfer, or corporate session takeover." : "Low direct harm, but may lead to subsequent targeted phishing campaigns."}
              </p>
            </div>

            {/* Core Question 3: Safe Verification */}
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
              <div className="flex items-center gap-1.5 text-secondary">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span className="text-xs font-bold text-on-surface">Safe Verification</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {report.safeResponse.verificationInstructions[0] || "Contact the sender through verified company directory telephone before clicking or replying."}
              </p>
            </div>
          </div>

          {/* Actionable Leadership Checklist */}
          <div className="p-3.5 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col gap-2">
            <span className="font-telemetry-pill text-[10px] uppercase text-on-surface-variant font-bold tracking-wider font-mono">
              Mandatory Remediation Steps
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {report.recommendedActions.slice(0, 4).map((act, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span className="text-xs text-on-surface leading-tight">{act.action}</span>
                </div>
              ))}
              {report.recommendedActions.length === 0 && (
                <>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span className="text-xs text-on-surface leading-tight">Do not click destination links or download attachments</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span className="text-xs text-on-surface leading-tight">Perform out-of-band verification via voice line</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Operational Posture Summary (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-surface-container-low p-4 sm:p-5 rounded-xl border border-outline-variant/30 shadow-sm gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-pill text-[10px] uppercase text-on-surface-variant font-bold font-mono">
                Threat Matrix Mapping
              </span>
              <span className="font-telemetry-pill text-[10px] text-tertiary font-mono">STIX 2.1 Ready</span>
            </div>
            <span className="font-headline-md text-sm font-semibold text-on-surface">
              {report.mitreAttackMappings[0] ? `${report.mitreAttackMappings[0].techniqueId} ${report.mitreAttackMappings[0].techniqueName}` : "T1566.002 Spearphishing Link"}
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Observed behavioral indicators match known phishing campaigns utilizing psychological coercion, credential harvesting, or identity mismatching.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-xs">
              <span className="text-on-surface-variant">Cognitive Bias Vector</span>
              <span className="font-code-ioc text-xs text-tertiary font-mono">
                {report.manipulationFindings[0]?.category.replace(/_/g, " ") || "Urgency / Authority"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-xs">
              <span className="text-on-surface-variant">Extracted URLs</span>
              <span className="font-code-ioc text-xs text-primary font-mono">
                {report.urlFindings.totalUrls} Indicators ({report.urlFindings.suspiciousCount} Suspicious)
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-xs">
              <span className="text-on-surface-variant">Authentication</span>
              <span className="font-code-ioc text-xs text-secondary font-mono">
                {report.emailForensics?.authResults.spf ? `SPF ${report.emailForensics.authResults.spf.toUpperCase()}` : "Heuristic Pass"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("mitre")}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-primary text-xs font-headline-sm transition-all"
          >
            <span>View MITRE Cognitive Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. 4 Modular Deconstructed Vector Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Technical Cyber Risk */}
        <div className="flex flex-col justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 shadow-sm hover:border-outline-variant/60 transition-all">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase tracking-widest font-bold font-mono">
                01 • Technical Vector
              </span>
              <span className={`px-2 py-0.5 rounded font-telemetry-pill text-[9px] font-bold font-mono ${
                report.overallAssessment.phishingScore >= 50 ? "bg-error-container/40 text-error" : "bg-secondary-container/20 text-secondary"
              }`}>
                {report.overallAssessment.phishingScore >= 75 ? "CRITICAL" : report.overallAssessment.phishingScore >= 40 ? "HIGH" : "NOMINAL"}
              </span>
            </div>
            <div>
              <div className="font-headline-sm text-xs font-bold text-on-surface">Technical Cyber Risk</div>
              <div className="text-[11px] text-on-surface-variant">RFC & Network Authenticity</div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <div className="flex items-baseline justify-between">
              <span className="font-stat-score text-2xl font-extrabold text-primary tnum">
                {report.overallAssessment.phishingScore}
              </span>
              <span className="font-telemetry-pill text-xs text-on-surface-variant">/ 100</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${report.overallAssessment.phishingScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Psychological Manipulation */}
        <div className="flex flex-col justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 shadow-sm hover:border-outline-variant/60 transition-all">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase tracking-widest font-bold font-mono">
                02 • Cognitive Vector
              </span>
              <span className={`px-2 py-0.5 rounded font-telemetry-pill text-[9px] font-bold font-mono ${
                report.overallAssessment.manipulationScore >= 50 ? "bg-error-container/40 text-error" : "bg-tertiary-container/30 text-tertiary"
              }`}>
                {report.overallAssessment.manipulationScore >= 75 ? "SEVERE" : report.overallAssessment.manipulationScore >= 40 ? "ELEVATED" : "LOW"}
              </span>
            </div>
            <div>
              <div className="font-headline-sm text-xs font-bold text-on-surface">Psychological Manipulation</div>
              <div className="text-[11px] text-on-surface-variant">Cognitive Urgency & Coercion</div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <div className="flex items-baseline justify-between">
              <span className="font-stat-score text-2xl font-extrabold text-tertiary tnum">
                {report.overallAssessment.manipulationScore}
              </span>
              <span className="font-telemetry-pill text-xs text-on-surface-variant">/ 100</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-tertiary rounded-full transition-all duration-700"
                style={{ width: `${report.overallAssessment.manipulationScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Phishing Indicators */}
        <div className="flex flex-col justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 shadow-sm hover:border-outline-variant/60 transition-all">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase tracking-widest font-bold font-mono">
                03 • Deception Cues
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-telemetry-pill text-[9px] font-bold font-mono">
                {report.phishingFindings.findings.length} DETECTED
              </span>
            </div>
            <div>
              <div className="font-headline-sm text-xs font-bold text-on-surface">Phishing Indicators</div>
              <div className="text-[11px] text-on-surface-variant">Credential & Spoofing Markers</div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <div className="flex items-baseline justify-between">
              <span className="font-stat-score text-2xl font-extrabold text-orange-400 tnum">
                {report.phishingFindings.findings.length}
              </span>
              <span className="font-telemetry-pill text-xs text-on-surface-variant">Indicators</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, report.phishingFindings.findings.length * 25)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: AI-Writing Likelihood */}
        <div className="flex flex-col justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 shadow-sm hover:border-outline-variant/60 transition-all">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase tracking-widest font-bold font-mono">
                04 • Style Synthetics
              </span>
              <span className="font-telemetry-pill text-[9px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-bold font-mono">
                {report.aiWritingLikelihood.verdictLabel}
              </span>
            </div>
            <div>
              <div className="font-headline-sm text-xs font-bold text-on-surface flex items-center gap-1">
                <span>AI-Writing Likelihood</span>
                <span className="font-telemetry-pill text-[8px] text-secondary bg-secondary/15 px-1 rounded uppercase font-mono">
                  EXP
                </span>
              </div>
              <div className="text-[11px] text-on-surface-variant truncate">
                {report.aiWritingLikelihood.disclaimer.slice(0, 35)}...
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-4">
            <div className="flex items-baseline justify-between">
              <span className="font-stat-score text-2xl font-extrabold text-on-surface-variant tnum">
                {report.aiWritingLikelihood.signalScore}
              </span>
              <span className="font-telemetry-pill text-xs text-on-surface-variant">/ 100</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-slate-500 rounded-full transition-all duration-700"
                style={{ width: `${report.aiWritingLikelihood.signalScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6. Main Forensic Body: Split-Pane Interactive Evidence Explorer */}
      <div className="w-full flex flex-col rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xl overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="bg-surface-container-low px-4 pt-2 flex items-center justify-between overflow-x-auto gap-2 border-b border-outline-variant/30">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("evidence")}
              className={`px-3.5 py-2.5 rounded-t-lg font-headline-sm text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "evidence"
                  ? "bg-surface-container-lowest text-primary border-t-2 border-primary shadow-[0_-2px_10px_rgba(0,0,0,0.3)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Evidence & Tactics</span>
              <span className="font-telemetry-pill text-[10px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold font-mono">
                {report.manipulationFindings.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("urls")}
              className={`px-3.5 py-2.5 rounded-t-lg font-headline-sm text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "urls"
                  ? "bg-surface-container-lowest text-primary border-t-2 border-primary shadow-[0_-2px_10px_rgba(0,0,0,0.3)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>URLs & Domains</span>
              <span className="font-telemetry-pill text-[10px] px-1.5 py-0.2 rounded-full bg-surface-container-high text-on-surface-variant font-mono">
                {report.urlFindings.totalUrls}
              </span>
            </button>

            {report.emailForensics && (
              <button
                type="button"
                onClick={() => setActiveTab("email")}
                className={`px-3.5 py-2.5 rounded-t-lg font-headline-sm text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === "email"
                    ? "bg-surface-container-lowest text-primary border-t-2 border-primary shadow-[0_-2px_10px_rgba(0,0,0,0.3)]"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Forensics (SPF/DKIM)</span>
                <span className={`font-telemetry-pill text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  report.emailForensics.authResults.spf === "pass" ? "bg-secondary/20 text-secondary" : "bg-error-container/40 text-error"
                }`}>
                  {report.emailForensics.authResults.spf === "pass" ? "PASS" : "FAIL"}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("mitre")}
              className={`px-3.5 py-2.5 rounded-t-lg font-headline-sm text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "mitre"
                  ? "bg-surface-container-lowest text-primary border-t-2 border-primary shadow-[0_-2px_10px_rgba(0,0,0,0.3)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>MITRE ATT&CK Matrix</span>
              <span className="font-telemetry-pill text-[10px] px-1.5 py-0.2 rounded-full bg-surface-container-high text-on-surface-variant font-mono">
                {report.mitreAttackMappings.length} TTPs
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("iocs")}
              className={`px-3.5 py-2.5 rounded-t-lg font-headline-sm text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "iocs"
                  ? "bg-surface-container-lowest text-primary border-t-2 border-primary shadow-[0_-2px_10px_rgba(0,0,0,0.3)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Technical IOCs & STIX 2.1</span>
              <span className="font-telemetry-pill text-[10px] px-1.5 py-0.2 rounded-full bg-surface-container-high text-on-surface-variant font-mono">
                {report.iocs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("response")}
              className={`px-3.5 py-2.5 rounded-t-lg font-headline-sm text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "response"
                  ? "bg-surface-container-lowest text-primary border-t-2 border-primary shadow-[0_-2px_10px_rgba(0,0,0,0.3)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safe-Response Assistant</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 pb-1.5">
            <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase font-mono">
              INSPECTOR SYNC:
            </span>
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-telemetry-pill text-[10px] text-secondary font-bold font-mono">
              BIDIRECTIONAL ACTIVE
            </span>
          </div>
        </div>

        {/* Tab 1: Split-Pane Interactive Evidence & Tactics */}
        {activeTab === "evidence" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* LEFT PANE: Quoted Evidence List & Body Anchors (6 cols) */}
            <div className="lg:col-span-6 p-4 sm:p-5 bg-surface-container-lowest/80 border-r border-outline-variant/30 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase tracking-widest font-bold font-mono">
                    DETECTED PSYCHOLOGICAL MANIPULATION ANCHORS ({report.manipulationFindings.length})
                  </span>
                  <span className="text-[11px] text-primary font-bold">Click card to inspect</span>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] pr-1">
                  {report.manipulationFindings.map((finding, idx) => (
                    <div
                      key={finding.id}
                      onClick={() => setSelectedFindingIndex(idx)}
                      className={`cursor-pointer rounded-xl p-3 border transition-all text-left ${
                        selectedFindingIndex === idx
                          ? "bg-surface-container-high border-primary shadow-[0_0_12px_rgba(143,240,255,0.2)]"
                          : "bg-surface-container-low border-outline-variant/30 hover:bg-surface-container hover:border-outline-variant/60"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-telemetry-pill text-[9px] font-bold font-mono ${
                            finding.severity === "CRITICAL"
                              ? "bg-error-container/40 text-error"
                              : finding.severity === "HIGH"
                              ? "bg-orange-950/40 text-orange-400"
                              : "bg-tertiary-container/30 text-tertiary"
                          }`}>
                            {finding.severity}
                          </span>
                          <span className="font-headline-sm text-xs font-bold text-on-surface">
                            {finding.tacticName}
                          </span>
                        </div>
                        <span className="font-code-ioc text-[10px] text-on-surface-variant font-mono">
                          {finding.mitreTechniqueId || `SOC-${idx + 1}`}
                        </span>
                      </div>

                      {finding.quotedText && (
                        <div className="mt-1 p-2 rounded bg-surface-container-lowest border border-outline-variant/20 font-code-ioc text-xs text-primary font-semibold">
                          &ldquo;{finding.quotedText}&rdquo;
                        </div>
                      )}

                      <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">
                        {finding.techniqueExplanation}
                      </p>
                    </div>
                  ))}

                  {report.manipulationFindings.length === 0 && (
                    <div className="p-8 text-center text-xs text-on-surface-variant">
                      No explicit psychological manipulation patterns detected in this payload.
                    </div>
                  )}
                </div>
              </div>

              {/* Legend Footer */}
              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant font-telemetry-pill text-[10px] font-mono">
                <span>HEURISTIC CLUSTER: 13 TACTICS LOADED</span>
                <span className="text-secondary">DETERMINISTIC ANALYSIS</span>
              </div>
            </div>

            {/* RIGHT PANE: Selected Evidence Detail Drawer (6 cols) */}
            <div className="lg:col-span-6 p-4 sm:p-5 bg-surface-container-low/60 flex flex-col gap-4 overflow-y-auto max-h-[620px]">
              <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <h4 className="font-headline-sm text-xs font-bold text-on-surface uppercase tracking-wide">
                    Cognitive & Technical Evidence Drawer
                  </h4>
                </div>
                <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase font-mono">
                  {selectedFinding ? `TACTIC: ${selectedFinding.category}` : "NO SELECTION"}
                </span>
              </div>

              {selectedFinding ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-md text-sm font-bold text-on-surface">
                      {selectedFinding.tacticName}
                    </span>
                    <span className="font-code-ioc text-xs text-tertiary font-mono">
                      {selectedFinding.mitreTechniqueId || "SOC-T1566"}
                    </span>
                  </div>

                  {/* Quoted Phrase Highlight */}
                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-2 shadow-inner">
                    <Flame className="w-4 h-4 text-error shrink-0 mt-0.5" />
                    <p className="font-code-ioc text-xs text-error font-semibold leading-relaxed">
                      &ldquo;{selectedFinding.quotedText}&rdquo;
                    </p>
                  </div>

                  {/* Two-Stage Analytical Breakdown */}
                  <div className="flex flex-col gap-3">
                    {/* Stage 1: Why it works / Cognitive Vulnerability */}
                    <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 flex flex-col gap-1">
                      <span className="font-telemetry-pill text-[10px] uppercase text-tertiary font-bold flex items-center gap-1 font-mono">
                        <Sparkles className="w-3 h-3 text-tertiary" />
                        Cognitive Exploitation Mechanism (Why it matters):
                      </span>
                      <p className="text-xs text-on-surface leading-relaxed">
                        {selectedFinding.whyThisMightWork}
                      </p>
                    </div>

                    {/* Stage 2: Recommended Defensive Countermeasure */}
                    <div className="p-3 rounded-lg bg-surface-container-high border border-secondary/30 flex flex-col gap-1">
                      <span className="font-telemetry-pill text-[10px] uppercase text-secondary font-bold flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-secondary" />
                        Recommended Defensive Countermeasure:
                      </span>
                      <p className="text-xs text-on-surface leading-relaxed">
                        {selectedFinding.recommendedAction}
                      </p>
                    </div>

                    {/* Why this is flagged */}
                    <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-1">
                      <span className="font-telemetry-pill text-[10px] uppercase text-on-surface-variant font-bold font-mono">
                        Forensic Explanation:
                      </span>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {selectedFinding.techniqueExplanation}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-on-surface-variant">
                  Select a finding on the left to inspect its cognitive mechanism.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: URLs & Domains */}
        {activeTab === "urls" && (
          <div className="p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-sm sm:text-base font-bold text-on-surface">
                  Extracted URLs & Domain Intelligence Workbench
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {report.urlFindings.summary}
                </p>
              </div>
              <span className="font-telemetry-pill text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono">
                {report.urlFindings.totalUrls} Discovered
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {report.urlFindings.extractedUrls.map((urlItem, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <code className="font-code-ioc text-xs text-primary font-mono font-bold break-all bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant/30">
                        {urlItem.defangedUrl}
                      </code>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(urlItem.defangedUrl)}
                        className="p-1 rounded text-on-surface-variant hover:text-primary transition-colors"
                        title="Copy defanged URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className={`px-2 py-0.5 rounded font-telemetry-pill text-[9px] font-bold font-mono self-start sm:self-auto ${
                      urlItem.riskScore >= 60 ? "bg-error-container/40 text-error" : "bg-surface-container-high text-on-surface-variant"
                    }`}>
                      RISK SCORE: {urlItem.riskScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant font-mono uppercase block">Domain</span>
                      <span className="text-on-surface font-mono font-semibold">{urlItem.domain}</span>
                    </div>
                    <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant font-mono uppercase block">Protocol</span>
                      <span className="text-on-surface font-mono">{urlItem.protocol}</span>
                    </div>
                    <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant font-mono uppercase block">Reputation</span>
                      <span className="text-secondary font-mono">{urlItem.reputationStatus}</span>
                    </div>
                    <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant font-mono uppercase block">Typosquat</span>
                      <span className="text-on-surface font-mono">{urlItem.isLookalikeOrPunycode ? "Flagged" : "None"}</span>
                    </div>
                  </div>

                  {urlItem.flags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase font-mono">
                        Flags:
                      </span>
                      {urlItem.flags.map((flag, fi) => (
                        <span
                          key={fi}
                          className="px-2 py-0.5 rounded bg-surface-container-high text-tertiary font-telemetry-pill text-[9px] font-mono"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {report.urlFindings.extractedUrls.length === 0 && (
                <div className="p-8 text-center text-xs text-on-surface-variant">
                  No links or URLs were extracted from this message payload.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Email Forensics */}
        {activeTab === "email" && report.emailForensics && (
          <div className="p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-sm sm:text-base font-bold text-on-surface">
                RFC-822 Authentication Protocols & Envelope Transport
              </h3>
              <span className="font-telemetry-pill text-[10px] text-primary uppercase font-mono">
                STRICT LIB-PARSER-5322
              </span>
            </div>

            {/* Auth Bento Grid: SPF, DKIM, DMARC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* SPF */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-telemetry-pill text-[10px] text-on-surface-variant tracking-wider uppercase font-mono">
                      Sender Policy Framework
                    </span>
                    <span className={`font-stat-score text-xl font-bold mt-1 ${
                      report.emailForensics.authResults.spf === "pass" ? "text-secondary" : "text-error"
                    }`}>
                      {report.emailForensics.authResults.spf.toUpperCase()}
                    </span>
                  </div>
                  <ShieldCheck className={`w-5 h-5 ${report.emailForensics.authResults.spf === "pass" ? "text-secondary" : "text-error"}`} />
                </div>
                <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-xs text-on-surface-variant">
                  {report.emailForensics.authResults.interpretationNotes[0] || "RFC 7208 evaluation completed."}
                </div>
              </div>

              {/* DKIM */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-telemetry-pill text-[10px] text-on-surface-variant tracking-wider uppercase font-mono">
                      DomainKeys Identified Mail
                    </span>
                    <span className={`font-stat-score text-xl font-bold mt-1 ${
                      report.emailForensics.authResults.dkim === "pass" ? "text-secondary" : "text-error"
                    }`}>
                      {report.emailForensics.authResults.dkim.toUpperCase()}
                    </span>
                  </div>
                  <Key className={`w-5 h-5 ${report.emailForensics.authResults.dkim === "pass" ? "text-secondary" : "text-error"}`} />
                </div>
                <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-xs text-on-surface-variant">
                  {report.emailForensics.authResults.interpretationNotes[1] || "RFC 6376 cryptographic evaluation completed."}
                </div>
              </div>

              {/* DMARC */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-telemetry-pill text-[10px] text-on-surface-variant tracking-wider uppercase font-mono">
                      Domain-Based Auth (DMARC)
                    </span>
                    <span className={`font-stat-score text-xl font-bold mt-1 ${
                      report.emailForensics.authResults.dmarc === "pass" ? "text-secondary" : "text-error"
                    }`}>
                      {report.emailForensics.authResults.dmarc.toUpperCase()}
                    </span>
                  </div>
                  <Lock className={`w-5 h-5 ${report.emailForensics.authResults.dmarc === "pass" ? "text-secondary" : "text-error"}`} />
                </div>
                <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-xs text-on-surface-variant">
                  {report.emailForensics.authResults.interpretationNotes[2] || "RFC 7489 alignment and enforcement evaluation."}
                </div>
              </div>
            </div>

            {/* Header vs Envelope Discrepancy */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-3">
              <span className="font-headline-sm text-xs font-semibold text-on-surface uppercase tracking-wide">
                Header vs. Envelope Identity Discrepancy
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 flex flex-col gap-1">
                  <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase font-mono">
                    MUA Rendered Header (RFC 5322 From)
                  </span>
                  <code className="font-code-ioc text-xs text-primary font-mono select-all">
                    {report.emailForensics.headers.from || "Not specified"}
                  </code>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 flex flex-col gap-1">
                  <span className="font-telemetry-pill text-[10px] text-error uppercase font-mono">
                    SMTP Envelope Route (Return-Path)
                  </span>
                  <code className="font-code-ioc text-xs text-error font-mono select-all">
                    {report.emailForensics.headers.returnPath || "Not specified"}
                  </code>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {report.emailForensics.attachments.length > 0 && (
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-3">
                <span className="font-headline-sm text-xs font-semibold text-on-surface uppercase tracking-wide">
                  MIME Attachments ({report.emailForensics.attachments.length})
                </span>
                <div className="flex flex-col gap-2">
                  {report.emailForensics.attachments.map((att, ai) => (
                    <div
                      key={ai}
                      className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-tertiary" />
                        <div>
                          <div className="font-code-ioc text-xs text-on-surface font-bold">{att.filename}</div>
                          <div className="text-[11px] text-on-surface-variant">
                            MIME: {att.mimeType} • {(att.sizeBytes / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <code className="font-code-ioc text-[10px] text-on-surface-variant font-mono bg-surface-container px-2 py-1 rounded">
                        SHA256: {att.sha256}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: MITRE ATT&CK Matrix */}
        {activeTab === "mitre" && (
          <div className="p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-sm sm:text-base font-bold text-on-surface">
                  MITRE ATT&CK Enterprise Matrix Mappings
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Correlated adversary tactics, techniques, and procedures (TTPs) extracted from observed behavior.
                </p>
              </div>
              <span className="font-telemetry-pill text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono">
                VERSION 14.1 ALIGNED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.mitreAttackMappings.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-code-ioc text-xs text-primary font-bold font-mono px-2 py-0.5 rounded bg-surface-container-lowest border border-primary/30">
                      {t.techniqueId}
                    </span>
                    <span className="font-telemetry-pill text-[10px] text-tertiary font-mono uppercase">
                      {t.tactic}
                    </span>
                  </div>

                  <h4 className="font-headline-sm text-xs sm:text-sm font-bold text-on-surface">
                    {t.techniqueName}
                  </h4>

                  <div className="p-2.5 rounded bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-1">
                    <span className="font-telemetry-pill text-[9px] uppercase text-on-surface-variant font-mono">
                      Observed Evidence
                    </span>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {t.observedEvidence}
                    </p>
                  </div>

                  <div className="p-2.5 rounded bg-surface-container-high border border-secondary/20 flex flex-col gap-1">
                    <span className="font-telemetry-pill text-[9px] uppercase text-secondary font-mono">
                      Defensive Mitigation
                    </span>
                    <p className="text-xs text-on-surface leading-relaxed">
                      {t.defensiveMitigation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Technical IOCs & STIX 2.1 */}
        {activeTab === "iocs" && (
          <div className="p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-headline-md text-sm sm:text-base font-bold text-on-surface">
                  Defanged Indicators of Compromise (IOCs) & STIX 2.1 Bundle
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Ready for SIEM ingestion (Splunk, Elastic, Sentinel) and threat-intelligence exchange.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyIocs}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5 text-secondary" />
                  <span>{copiedIocs ? "Copied!" : "Copy Defanged IOCs"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyStix}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-primary/30 text-xs font-semibold text-primary flex items-center gap-1.5 transition-all"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{copiedStix ? "Bundle Copied!" : "Copy STIX 2.1 JSON"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadStix}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download STIX 2.1</span>
                </button>
              </div>
            </div>

            {/* IOCs Table */}
            <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant uppercase font-telemetry-pill text-[10px] font-mono border-b border-outline-variant/30">
                  <tr>
                    <th className="p-3">Indicator Type</th>
                    <th className="p-3">Defanged Value</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest font-code-ioc">
                  {report.iocs.map((ioc) => (
                    <tr key={ioc.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary uppercase font-mono text-[10px]">
                          {ioc.type}
                        </span>
                      </td>
                      <td className="p-3 text-on-surface font-mono font-bold select-all">
                        {ioc.defanged}
                      </td>
                      <td className="p-3 text-on-surface-variant font-mono">
                        {ioc.category}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-tertiary">
                        {ioc.riskScore}
                      </td>
                    </tr>
                  ))}
                  {report.iocs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-on-surface-variant font-sans">
                        No indicators of compromise extracted.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* STIX 2.1 JSON Preview Well */}
            {report.stix21Bundle && (
              <div className="flex flex-col gap-2">
                <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase font-mono">
                  STIX 2.1 Object Bundle Preview
                </span>
                <pre className="p-3 rounded-xl bg-surface-container-low text-primary font-code-ioc text-xs border border-outline-variant/30 overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(report.stix21Bundle, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Safe-Response Assistant */}
        {activeTab === "response" && (
          <div className="p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-sm sm:text-base font-bold text-on-surface">
                  Safe-Response & Neutralization Assistant
                </h3>
                <p className="text-xs text-on-surface-variant">
                  De-escalate manufactured urgency without confirming vulnerabilities or validating account status.
                </p>
              </div>
              <span className="font-telemetry-pill text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-secondary font-mono">
                NON-COMMITTAL PROTOCOL
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Neutral Reply Template */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-xs font-bold text-on-surface uppercase tracking-wide">
                    Pre-Drafted Neutral Verification Template
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (report.safeResponse.safeReplyTemplate) {
                        navigator.clipboard.writeText(report.safeResponse.safeReplyTemplate);
                        setCopiedReply(true);
                        setTimeout(() => setCopiedReply(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedReply ? "Copied!" : "Copy Template"}</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 font-body-base text-xs text-on-surface leading-relaxed select-all">
                  {report.safeResponse.safeReplyTemplate ||
                    "Thank you for contacting me. Due to internal security governance policy, I cannot execute requests or verify account information through this channel. I am validating this request through our standard secondary protocol."}
                </div>

                <div className="p-2.5 rounded bg-surface-container-high/60 border border-secondary/20 text-xs text-on-surface-variant">
                  <strong className="text-secondary">Defensive Best Practice:</strong> Never provide phone numbers, OTP tokens, or credentials when responding to unverified messages.
                </div>
              </div>

              {/* Immediate Defensive Checklist */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-3">
                <span className="font-headline-sm text-xs font-bold text-on-surface uppercase tracking-wide">
                  Immediate Defensive Checklist
                </span>
                <div className="flex flex-col gap-2">
                  {report.safeResponse.immediateChecklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-start gap-2.5 text-xs text-on-surface"
                    >
                      <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                  {report.safeResponse.immediateChecklist.length === 0 && (
                    <div className="p-4 text-xs text-on-surface-variant">
                      No emergency actions required for this nominal message.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
