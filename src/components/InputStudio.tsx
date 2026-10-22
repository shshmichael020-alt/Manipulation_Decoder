"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  FileText,
  Mail,
  Link2,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Code2,
  WrapText,
  ShieldCheck,
  Eye,
  Key,
  Flame,
} from "lucide-react";
import { DEMO_SCENARIOS, DemoScenario } from "@/data/demo-messages";
import { AnalyzeRequest, InvestigationMode } from "@/types/analyzer";

interface InputStudioProps {
  onAnalyze: (payload: AnalyzeRequest) => Promise<void>;
  isLoading: boolean;
}

export function InputStudio({ onAnalyze, isLoading }: InputStudioProps) {
  const [mode, setMode] = useState<InvestigationMode>("message");

  // Mode A: Message state
  const [message, setMessage] = useState(
    "URGENT: Executive Payroll Wire Verification Required within 45 minutes to prevent account suspension. Review authorization memo: hxxps://internal-portal-exec-auth[.]live/re-verify?token=8941f... Attached security update patch must be acknowledged immediately. Failure to verify will halt corporate transactions."
  );
  const [senderName, setSenderName] = useState("Michael Vance (CEO Impersonation)");
  const [senderAddress, setSenderAddress] = useState("m.vance@acme-corp-management.security.internal");
  const [contextType, setContextType] = useState<
    "email" | "sms" | "chat" | "social" | "payment" | "other"
  >("email");
  const [isMonoFont, setIsMonoFont] = useState(true);
  const [isWrapLines, setIsWrapLines] = useState(true);
  const [enableAiCheck, setEnableAiCheck] = useState(true);

  // Mode B: EML state
  const [emlContent, setEmlContent] = useState("");
  const [emlFileName, setEmlFileName] = useState<string | null>(null);

  // Mode C: URL state
  const [targetUrl, setTargetUrl] = useState("hxxps://internal-portal-exec-auth[.]live/re-verify");

  // Mode D: Screenshot OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrExtractedText, setOcrExtractedText] = useState("");
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate live counters for current payload
  const currentText = useMemo(() => {
    if (mode === "message") return message;
    if (mode === "email_forensics") return emlContent;
    if (mode === "url") return targetUrl;
    if (mode === "screenshot") return ocrExtractedText;
    return "";
  }, [mode, message, emlContent, targetUrl, ocrExtractedText]);

  const charCount = currentText.length;
  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
  const lineCount = Math.max(1, currentText.split("\n").length);

  // Detect simple URLs
  const detectedUrlCount = useMemo(() => {
    const matches = currentText.match(/(https?:\/\/[^\s]+|hxxps?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\[\.\][a-zA-Z]{2,})/gi);
    return matches ? matches.length : 0;
  }, [currentText]);

  // Detect urgent keywords
  const detectedUrgencyTokens = useMemo(() => {
    const urgentWords = ["urgent", "immediately", "within", "halt", "suspension", "deadline", "expire", "critical", "action required"];
    const lower = currentText.toLowerCase();
    return urgentWords.filter(w => lower.includes(w)).length;
  }, [currentText]);

  const handleClear = () => {
    setMessage("");
    setSenderName("");
    setSenderAddress("");
    setEmlContent("");
    setEmlFileName(null);
    setTargetUrl("");
    setOcrExtractedText("");
    setOcrImagePreview(null);
    setValidationError(null);
  };

  const handleLoadPreset = (presetKey: string) => {
    setMode("message");
    setValidationError(null);
    if (presetKey === "wire") {
      setMessage("URGENT: Executive Payroll Wire Verification Required within 45 minutes to prevent account suspension. Review authorization memo: hxxps://internal-portal-exec-auth[.]live/re-verify?token=8941f... Attached security update patch must be acknowledged immediately. Failure to verify will halt corporate transactions.");
      setSenderName("Michael Vance (CEO Impersonation)");
      setSenderAddress("m.vance@acme-corp-management.security.internal");
      setContextType("email");
    } else if (presetKey === "vendor") {
      setMessage("Dear Accounts Payable Partner,\n\nPlease find attached the revised vendor remit statement for invoice #INV-99214. Due to standard banking audits, our EFT banking coordinates have migrated. Kindly route all pending Q4 disbursements to the updated treasury escrow routing detailed herein.\n\nWarm regards,\nGlobal Logistics Billing Division");
      setSenderName("Apex Supplier Billing Services");
      setSenderAddress("remit-update@apex-logistics-vendor-corp.com");
      setContextType("email");
    } else if (presetKey === "clean") {
      setMessage("Hi team,\n\nJust a reminder that our bi-weekly architecture synchronization meeting is scheduled for tomorrow at 10:00 AM UTC in the standard conference room. The agenda and notes doc are shared on the team drive.\n\nBest,\nSarah Jenkins");
      setSenderName("Sarah Jenkins");
      setSenderAddress("s.jenkins@acme-corp.com");
      setContextType("email");
    } else if (presetKey === "mfa") {
      setMessage("CRITICAL IT ALERT: A new login to your corporate single sign-on (SSO) was detected from Nizhny Novgorod, RU. If this was not you, confirm your identity and reset your MFA authenticator token immediately at: https://login.microsoftonline.com-auth-reset.biz/tenant/restore");
      setSenderName("Enterprise IT Helpdesk");
      setSenderAddress("helpdesk@internal-it-support.net");
      setContextType("email");
    }
  };

  // Defang URLs in current text
  const handleDefangAll = () => {
    if (mode === "message") {
      const defanged = message
        .replace(/https:\/\//gi, "hxxps://")
        .replace(/http:\/\//gi, "hxxp://")
        .replace(/\.([a-z]{2,})/gi, "[.]$1");
      setMessage(defanged);
    } else if (mode === "url") {
      const defanged = targetUrl
        .replace(/https:\/\//gi, "hxxps://")
        .replace(/http:\/\//gi, "hxxp://")
        .replace(/\.([a-z]{2,})/gi, "[.]$1");
      setTargetUrl(defanged);
    }
  };

  // Sample raw EML generator for quick testing
  const handleLoadSampleEml = () => {
    setMode("email_forensics");
    const sample = `From: "Michael Vance, CEO" <m.vance@internal-corporate-desk.com>
To: finance-ops@acme-corp.com
Return-Path: <daemon@mail-relay-v4.untrusted-host.net>
Subject: URGENT: Executive Payroll Wire Verification Required within 45 minutes
Date: Wed, 16 Oct 2026 14:10:00 +0000
Message-ID: <202610161410.sec-notice@untrusted-host.net>
Authentication-Results: mx.google.com; spf=softfail (relay 198.51.100.44 not permitted sender); dkim=none; dmarc=fail (p=quarantine)
Received: from mail-relay-v4.untrusted-host.net (198.51.100.44) by mx.google.com with ESMTPS id 4920412; Wed, 16 Oct 2026 14:10:02 +0000
Content-Type: multipart/mixed; boundary="BOUNDARY_XYZ_123"

--BOUNDARY_XYZ_123
Content-Type: text/html; charset="UTF-8"

<html>
<body>
<p>Team,</p>
<p>This is an immediate instruction. We have an unverified payroll allocation discrepancy that must be resolved today.</p>
<p><b>URGENT: Executive Payroll Wire Verification Required within 45 minutes prior to the banking cut-off threshold.</b></p>
<p>You must complete authorization immediately to prevent immediate account suspension and employee payroll halt scheduled for tomorrow morning.</p>
<p><a href="http://internal-portal-exec-auth.live/re-verify">https://internal-portal-exec-auth.live/re-verify</a></p>
<p>Regards,<br/>Michael Vance, Chief Executive Officer<br/>Acme Enterprise Holdings Inc.</p>
</body>
</html>

--BOUNDARY_XYZ_123
Content-Disposition: attachment; filename="Payroll_Auth_Patch.scr"
Content-Type: application/x-scr

[BINARY_PAYLOAD_MOCKED]
--BOUNDARY_XYZ_123--`;
    setEmlContent(sample);
    setEmlFileName("executive-wire-impersonation.eml");
    setValidationError(null);
  };

  // Handle .eml file upload
  const handleEmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 256000) {
      setValidationError("EML file exceeds maximum size limit of 250KB.");
      return;
    }

    setEmlFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setEmlContent(text);
      setValidationError(null);
    };
    reader.readAsText(file);
  };

  // Handle Screenshot OCR upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setValidationError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setValidationError("Image file exceeds 5MB limit.");
      return;
    }

    setValidationError(null);
    const imageUrl = URL.createObjectURL(file);
    setOcrImagePreview(imageUrl);
    setOcrLoading(true);
    setOcrProgress(15);

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      setOcrProgress(50);
      const ret = await worker.recognize(file);
      setOcrProgress(90);
      await worker.terminate();

      const extracted = ret.data.text.trim();
      setOcrExtractedText(extracted);
      setOcrProgress(100);
    } catch (err: any) {
      console.error("[OCR Failure]", err);
      setValidationError(
        "Client-side OCR failed to read image. You can type or paste the message directly."
      );
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    let payloadMessage = "";
    let rawEml: string | undefined = undefined;
    let urlParam: string | undefined = undefined;

    if (mode === "message") {
      payloadMessage = message.trim();
      if (!payloadMessage) {
        setValidationError("Please paste or type a message to analyze.");
        return;
      }
    } else if (mode === "email_forensics") {
      rawEml = emlContent.trim();
      if (!rawEml) {
        setValidationError("Please upload a .eml file or paste raw RFC 822 email headers.");
        return;
      }
      payloadMessage = rawEml;
    } else if (mode === "url") {
      urlParam = targetUrl.trim();
      if (!urlParam) {
        setValidationError("Please enter a URL to analyze.");
        return;
      }
      payloadMessage = urlParam;
    } else if (mode === "screenshot") {
      payloadMessage = ocrExtractedText.trim();
      if (!payloadMessage) {
        setValidationError("No text extracted from screenshot. Please upload an image or edit the text.");
        return;
      }
    }

    await onAnalyze({
      mode,
      message: payloadMessage,
      senderName: senderName.trim() || undefined,
      senderAddress: senderAddress.trim() || undefined,
      contextType,
      rawEmlContent: rawEml,
      targetUrl: urlParam,
      userAgreedToScan: true,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-4">
      {/* 4 Selectable Investigation Mode Tabs (Segmented Technical Control) */}
      <div className="w-full bg-surface-container-lowest p-1 rounded-xl shadow-inner border border-outline-variant/30 flex flex-wrap lg:flex-nowrap items-center gap-1">
        <button
          type="button"
          onClick={() => setMode("message")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-headline-sm text-xs sm:text-sm font-bold transition-all ${
            mode === "message"
              ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(143,240,255,0.35)]"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Message Analysis</span>
          <span className={`font-code-ioc text-[10px] px-1.5 py-0.2 rounded ml-1 ${
            mode === "message" ? "bg-on-primary/20 text-on-primary" : "bg-surface-container-high text-primary"
          }`}>
            PRIMARY
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMode("email_forensics")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-headline-sm text-xs sm:text-sm font-bold transition-all ${
            mode === "email_forensics"
              ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(143,240,255,0.35)]"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email Forensics (.eml / raw)</span>
          <span className="font-telemetry-pill text-[10px] text-secondary">RFC-822</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-headline-sm text-xs sm:text-sm font-bold transition-all ${
            mode === "url"
              ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(143,240,255,0.35)]"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>URL & Domain Intelligence</span>
          <span className="font-telemetry-pill text-[10px] text-on-surface-variant">DEFANG</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("screenshot")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-headline-sm text-xs sm:text-sm font-bold transition-all ${
            mode === "screenshot"
              ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(143,240,255,0.35)]"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Screenshot & OCR</span>
          <span className="font-telemetry-pill text-[10px] px-1.5 rounded bg-tertiary/15 text-tertiary">VISION</span>
        </button>
      </div>

      {/* Validation alert banner */}
      {validationError && (
        <div className="p-3 rounded-xl bg-error-container/40 border border-error/50 text-error text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-error" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Primary Workspace Layout: Split 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT PRIMARY WORKSPACE (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Metadata Input Fields Ribbon (Available for Mode A & B) */}
          {(mode === "message" || mode === "email_forensics") && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
              <div className="flex flex-col gap-1">
                <label className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Sender Display Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Michael Vance (CEO)"
                    className="w-full bg-surface-container-lowest text-on-surface text-xs font-body-sm rounded-lg px-3 py-2 border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                  />
                  {senderName.toLowerCase().includes("ceo") && (
                    <span className="absolute right-2 top-2 font-telemetry-pill text-[9px] px-1 py-0.5 rounded bg-error-container/40 text-error font-bold">
                      FLAGGED
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  Envelope / Header Address
                </label>
                <input
                  type="text"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  placeholder="e.g. m.vance@internal-corporate.com"
                  className="w-full bg-surface-container-lowest text-on-surface font-code-ioc text-xs rounded-lg px-3 py-2 border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-secondary shadow-inner truncate"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  Context Simulation
                </label>
                <select
                  value={contextType}
                  onChange={(e) => setContextType(e.target.value as any)}
                  className="w-full bg-surface-container-lowest text-on-surface text-xs rounded-lg px-3 py-2 border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-tertiary shadow-inner cursor-pointer"
                >
                  <option value="email">Corporate Communications / Wire</option>
                  <option value="chat">Internal IT Infrastructure & MFA</option>
                  <option value="payment">Banking, Treasury & Escrow</option>
                  <option value="sms">SMS / Mobile Urgency Vector</option>
                  <option value="social">Social Engineering / Executive</option>
                  <option value="other">Shipping, Parcel & Freight</option>
                </select>
              </div>
            </div>
          )}

          {/* Mode-Specific Worksurfaces */}
          {mode === "message" && (
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-xl flex flex-col">
              {/* Editor Sub-Header Toolbar */}
              <div className="bg-surface-container-low px-3 py-2 flex items-center justify-between border-b border-outline-variant/30">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-error" />
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  </div>
                  <span className="font-code-ioc text-xs text-on-surface-variant/80">raw_payload_buffer.txt</span>
                  <span className="font-telemetry-pill text-[9px] px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono">
                    UTF-8 STRICT
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsMonoFont(!isMonoFont)}
                    className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface font-code-ioc text-xs flex items-center gap-1 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{isMonoFont ? "Mono: ON" : "Sans: ON"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDefangAll}
                    title="Defang URLs (http -> hxxp)"
                    className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-primary font-code-ioc text-xs flex items-center gap-1 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Defang All</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWrapLines(!isWrapLines)}
                    className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface font-code-ioc text-xs flex items-center gap-1 transition-colors"
                  >
                    <WrapText className="w-3.5 h-3.5" />
                    <span>{isWrapLines ? "Wrap: ON" : "Wrap: OFF"}</span>
                  </button>
                </div>
              </div>

              {/* Editor Viewport with Gutter Line Numbers */}
              <div className="flex min-h-[300px] max-h-[460px] overflow-hidden bg-surface-container-lowest relative">
                {/* Line Numbers Rail */}
                <div className="w-10 bg-surface-container-low select-none flex flex-col items-end py-3 pr-2 text-on-surface-variant/40 space-y-1 font-mono text-xs border-r border-outline-variant/20 overflow-hidden">
                  {Array.from({ length: Math.min(lineCount, 16) }).map((_, i) => (
                    <span key={i}>{String(i + 1).padStart(2, "0")}</span>
                  ))}
                  {lineCount > 16 && <span>..</span>}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  spellCheck={false}
                  placeholder="Paste suspicious email, SMS, direct message, or communication text here..."
                  className={`flex-1 bg-transparent text-on-surface p-3 resize-none focus:outline-none leading-relaxed placeholder:text-on-surface-variant/30 selection:bg-primary-container selection:text-on-primary ${
                    isMonoFont ? "font-code-ioc text-xs" : "font-body-base text-sm"
                  } ${isWrapLines ? "whitespace-pre-wrap" : "whitespace-pre overflow-x-auto"}`}
                />
              </div>

              {/* Realtime Live Counters Bar */}
              <div className="bg-surface-container-low px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-on-surface-variant font-code-ioc text-xs border-t border-outline-variant/30">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="text-on-surface font-bold tnum">{charCount}</span> Chars
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-on-surface font-bold tnum">{wordCount}</span> Words
                  </span>
                  <span className="flex items-center gap-1 text-tertiary">
                    <Link2 className="w-3.5 h-3.5" />
                    <span className="font-bold tnum">{detectedUrlCount}</span> URLs
                  </span>
                  {detectedUrgencyTokens > 0 && (
                    <span className="flex items-center gap-1 text-error">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="font-bold tnum">{detectedUrgencyTokens}</span> Urgency Cues
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-telemetry-pill text-[10px] text-secondary">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span>ZERO EXFILTRATION GUARANTEE</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode B: Email Forensics (.eml / raw) */}
          {mode === "email_forensics" && (
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-xl flex flex-col gap-3 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
                      RFC-822 Email Forensics Buffer
                    </div>
                    <div className="text-[11px] text-on-surface-variant">
                      Inspect raw headers, SPF/DKIM assertions, MIME attachments, and hop routing
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".eml,message/rfc822,text/plain"
                    onChange={handleEmlFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container-highest border border-primary/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload .EML</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleEml}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:text-secondary border border-outline-variant/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <span>Load Sample .EML</span>
                  </button>
                </div>
              </div>

              {emlFileName && (
                <div className="px-3 py-1.5 rounded bg-surface-container-high/80 border border-secondary/30 text-xs flex items-center justify-between text-secondary font-mono">
                  <span>Attached: {emlFileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmlContent("");
                      setEmlFileName(null);
                    }}
                    className="text-on-surface-variant hover:text-error"
                  >
                    Remove
                  </button>
                </div>
              )}

              <textarea
                value={emlContent}
                onChange={(e) => setEmlContent(e.target.value)}
                rows={12}
                spellCheck={false}
                placeholder="Paste raw email RFC-822 headers and body (From:, Received:, Authentication-Results:, DKIM-Signature:, MIME)..."
                className="w-full bg-surface-container-low text-primary p-3 rounded-lg border border-outline-variant/30 font-code-ioc text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-on-surface-variant/30 leading-relaxed"
              />
            </div>
          )}

          {/* Mode C: URL & Domain Intelligence */}
          {mode === "url" && (
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-xl flex flex-col gap-3 p-4">
              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30 flex flex-col gap-2">
                <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-primary" />
                  Target URL / Domain for Isolation Inspection
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example-portal-login.com/auth or defanged hxxps://..."
                    className="flex-1 bg-surface-container-lowest text-primary font-code-ioc text-xs rounded-lg px-3 py-2.5 border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleDefangAll}
                    className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-primary font-code-ioc text-xs border border-outline-variant/40 flex items-center gap-1 transition-all"
                  >
                    <span>Defang</span>
                  </button>
                </div>
              </div>

              {/* Safe Inspection Notice */}
              <div className="p-3 rounded-lg bg-surface-container-low/70 border border-outline-variant/20 flex items-start gap-2.5 text-xs text-on-surface-variant">
                <ShieldCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-on-surface mb-0.5">Air-Gapped Domain Inspection</div>
                  <div>
                    URLs are parsed syntactically for punycode, typosquatting heuristics, brand keywords, Shannon entropy, and suspicious TLD patterns without triggering client-side browser fetches.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode D: Screenshot & OCR */}
          {mode === "screenshot" && (
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-xl flex flex-col gap-3 p-4">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div
                onClick={() => imageInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-outline-variant/50 hover:border-primary/50 bg-surface-container-low/50 hover:bg-surface-container-low p-6 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform">
                  {ocrLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : (
                    <Upload className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="text-xs sm:text-sm font-bold text-on-surface">
                  {ocrLoading ? "Extracting Text via Tesseract.js..." : "Drop Screenshot Here or Browse"}
                </div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  PNG, JPG, or WebP up to 5MB • 100% Client-Side In-Browser OCR
                </div>
              </div>

              {/* Progress bar */}
              {ocrLoading && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono text-primary">
                    <span>Optical Character Recognition in Progress...</span>
                    <span>{ocrProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Extracted text review area */}
              {ocrExtractedText && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
                    <span className="text-secondary font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                      Extracted Text Buffer (Editable)
                    </span>
                    <span>{ocrExtractedText.length} characters</span>
                  </div>
                  <textarea
                    value={ocrExtractedText}
                    onChange={(e) => setOcrExtractedText(e.target.value)}
                    rows={6}
                    className="w-full bg-surface-container-low text-on-surface p-3 rounded-lg border border-outline-variant/30 font-code-ioc text-xs focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}

          {/* Preset Chips & Analysis Options Ribbon */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="font-telemetry-pill text-[10px] text-on-surface-variant uppercase mr-1">
                Quick Presets:
              </span>
              <button
                type="button"
                onClick={() => handleLoadPreset("wire")}
                className="px-2.5 py-1 rounded bg-surface-container-high text-primary hover:bg-primary/20 text-xs font-headline-sm transition-all flex items-center gap-1 border border-primary/20"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Executive Urgent Wire
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset("vendor")}
                className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface text-xs font-headline-sm transition-all flex items-center gap-1 border border-outline-variant/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                AI-Generated Fake Vendor
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset("clean")}
                className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface text-xs font-headline-sm transition-all flex items-center gap-1 border border-outline-variant/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Benign Meeting Invite
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset("mfa")}
                className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant hover:text-error text-xs font-headline-sm transition-all flex items-center gap-1 border border-outline-variant/30"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-error" />
                Credential Reset Hook
              </button>
            </div>

            {/* Heuristic Option Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={enableAiCheck}
                onChange={(e) => setEnableAiCheck(e.target.checked)}
                className="w-4 h-4 rounded bg-surface-container-lowest text-primary focus:ring-primary accent-primary"
              />
              <span className="font-body-sm text-xs text-on-surface">
                Experimental AI-Writing Check
              </span>
            </label>
          </div>

          {/* Action Bar (High-Contrast Execution Triggers) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSubmit}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-headline-md text-sm sm:text-base font-bold shadow-[0_0_16px_rgba(143,240,255,0.35)] hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Deconstructing Payload...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Analyze Message</span>
                    <kbd className="font-code-ioc text-[10px] px-1.5 py-0.5 rounded bg-on-primary/20 text-on-primary font-bold">
                      ⌘↵
                    </kbd>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-3 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-error hover:bg-error-container/20 border border-outline-variant/30 font-headline-sm text-xs sm:text-sm transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-on-surface-variant font-code-ioc text-xs">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span>Zero Server Roundtrip • Local Heuristics Loaded</span>
            </div>
          </div>
        </div>

        {/* RIGHT SECONDARY RAIL: ENGINE PIPELINE OVERVIEW (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Card 1: Input Ingestion Modes Overview */}
          <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/30 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-xs font-semibold text-on-surface flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                Active Analysis Pipeline
              </span>
              <span className="font-telemetry-pill text-[9px] px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono">
                AIR-GAPPED
              </span>
            </div>

            {/* Ingestion Feature Stack */}
            <div className="flex flex-col gap-2">
              {/* Item 1: Email Headers DKIM/SPF Test */}
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
                  <Mail className="w-3.5 h-3.5 text-secondary" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-xs text-on-surface font-semibold">
                      RFC-822 Envelope Auth
                    </span>
                    <span className="font-telemetry-pill text-[9px] text-secondary font-mono">STRICT</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 leading-tight">
                    Evaluates SPF alignment, DKIM cryptographic integrity, and DMARC enforcement policies.
                  </span>
                </div>
              </div>

              {/* Item 2: 13 Psychological Tactics */}
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded bg-surface-container-high flex items-center justify-center text-tertiary shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-tertiary" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-xs text-on-surface font-semibold">
                      Cognitive Coercion Core
                    </span>
                    <span className="font-telemetry-pill text-[9px] text-tertiary font-mono">13 TACTICS</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 leading-tight">
                    Dissects urgency, false authority, fear, FOMO, cognitive scarcity, and pretexting.
                  </span>
                </div>
              </div>

              {/* Item 3: Domain Reputation */}
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                  <Link2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-xs text-on-surface font-semibold">
                      URL & Typosquat Engine
                    </span>
                    <span className="font-telemetry-pill text-[9px] text-primary font-mono">DEFANGED</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 leading-tight">
                    Punycode obfuscation, Shannon entropy analysis, and lookalike corporate brand matching.
                  </span>
                </div>
              </div>

              {/* Item 4: AI Stylometrics */}
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                  <FileText className="w-3.5 h-3.5 text-on-surface-variant" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-xs text-on-surface font-semibold">
                      Experimental Stylometrics
                    </span>
                    <span className="font-telemetry-pill text-[9px] text-on-surface-variant font-mono">DECOUPLED</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 leading-tight">
                    Perplexity, burstiness, and syntactic symmetry heuristics (transparently non-definitive).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Integrity Card */}
          <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/30 shadow-md flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">Client Memory Sandbox</span>
              <span className="font-telemetry-pill text-[10px] text-secondary">
                AIR-GAPPED TELEMETRY
              </span>
            </div>
            <span className="font-telemetry-pill text-[10px] px-2 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/30 font-bold uppercase font-mono">
              ACTIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
