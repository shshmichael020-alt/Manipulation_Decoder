"use client";

import React, { useState, useRef } from "react";
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
  Mail,
  Link2,
  Camera,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
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
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [contextType, setContextType] = useState<
    "email" | "sms" | "chat" | "social" | "payment" | "other"
  >("email");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Mode B: EML state
  const [emlContent, setEmlContent] = useState("");
  const [emlFileName, setEmlFileName] = useState<string | null>(null);

  // Mode C: URL state
  const [targetUrl, setTargetUrl] = useState("");

  // Mode D: Screenshot OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrExtractedText, setOcrExtractedText] = useState("");
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const handleLoadDemo = (demo: DemoScenario) => {
    setMode("message");
    setMessage(demo.message);
    setSenderName(demo.senderName || "");
    setSenderAddress(demo.senderAddress || "");
    setContextType(demo.contextType);
    setValidationError(null);
  };

  // Sample raw EML generator for quick testing
  const handleLoadSampleEml = () => {
    setMode("email_forensics");
    const sample = `From: "Bank of America Online" <support@customer-update-auth.xyz>
To: target-user@company.com
Reply-To: security.response@gmail.com
Return-Path: <bounce@unregistered-relay.top>
Subject: URGENT: Security Alert - Immediate Action Required
Date: Wed, 16 Oct 2026 14:10:00 +0000
Message-ID: <202610161410.sec-notice@customer-update-auth.xyz>
Authentication-Results: mx.google.com; spf=fail (google.com: domain of support@customer-update-auth.xyz does not designate 192.168.1.180 as permitted sender); dkim=fail; dmarc=fail
Received: from mail.unregistered-relay.top (192.168.1.180) by mx.google.com with ESMTPS id 4920412; Wed, 16 Oct 2026 14:10:02 +0000
Content-Type: multipart/mixed; boundary="BOUNDARY_XYZ_123"

--BOUNDARY_XYZ_123
Content-Type: text/html; charset="UTF-8"

<html>
<body>
<p>Dear Valued Customer,</p>
<p>Your online banking profile has been locked due to unauthorized login attempts. Confirm your 6-digit OTP code within 24 hours.</p>
<p><a href="http://bankofamerica.com.account-verify.xyz/login">https://www.bankofamerica.com/verify-identity</a></p>
</body>
</html>

--BOUNDARY_XYZ_123
Content-Disposition: attachment; filename="SecurityPatch_Install.scr"
Content-Type: application/x-scr

[BINARY_PAYLOAD_MOCKED]
--BOUNDARY_XYZ_123--`;
    setEmlContent(sample);
    setEmlFileName("sample-bank-phishing.eml");
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
    setOcrProgress(10);

    try {
      // Dynamic import of tesseract.js for client-side processing
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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      {/* 4 Investigation Modes Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("message")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              mode === "message"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Mode A: Message</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("email_forensics")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              mode === "email_forensics"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Mode B: Email Forensics</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              mode === "url"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Mode C: URL Intel</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("screenshot")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              mode === "screenshot"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Mode D: Screenshot OCR</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-500 font-mono pr-2">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>Local In-Memory Inspection</span>
        </div>
      </div>

      {/* Demo quick-select pills for Mode A */}
      {mode === "message" && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Curated Test Scenarios</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Processed through live multi-engine pipeline
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
      )}

      {/* Main Analysis Form Card */}
      <form
        onSubmit={handleSubmit}
        className="cyber-card rounded-xl p-5 border border-surface-border shadow-2xl relative overflow-hidden"
      >
        {/* MODE A: MESSAGE INPUT */}
        {mode === "message" && (
          <div>
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
                <span>
                  {showAdvanced ? "Hide Sender Context" : "Add Sender Details (Optional)"}
                </span>
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

            <textarea
              id="message-input"
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste suspicious email, SMS, notification, or message here...
e.g. 'URGENT: Your account has been suspended. Click here to confirm your 6-digit OTP code before access is permanently revoked.'"
              className="w-full p-3.5 rounded-lg bg-surface border border-surface-border text-slate-100 placeholder-slate-500 text-sm font-sans focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all resize-y min-h-[140px]"
            />

            <div className="flex items-center justify-between mt-2 text-xs text-slate-400 font-mono">
              <span>{message.trim() ? message.trim().split(/\s+/).length : 0} words</span>
              <span>{message.length.toLocaleString()} / 50,000 chars</span>
            </div>
          </div>
        )}

        {/* MODE B: EMAIL FORENSICS */}
        {mode === "email_forensics" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Raw .EML File & Email Headers Analysis</span>
              </label>

              <button
                type="button"
                onClick={handleLoadSampleEml}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Phishing .EML</span>
              </button>
            </div>

            {/* Drag & Drop or Browse file */}
            <div className="mb-3">
              <input
                type="file"
                ref={fileInputRef}
                accept=".eml,.txt"
                onChange={handleEmlFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-lg border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-900/50 cursor-pointer flex flex-col items-center justify-center text-center transition-colors"
              >
                <Upload className="w-6 h-6 text-cyan-400 mb-1.5" />
                <span className="text-xs font-semibold text-slate-200">
                  {emlFileName ? `Loaded: ${emlFileName}` : "Click to select a .eml file or drag here"}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Safe client parsing • Extracts From/Reply-To, SPF/DKIM/DMARC, routing hops & attachments
                </span>
              </div>
            </div>

            <textarea
              rows={7}
              value={emlContent}
              onChange={(e) => setEmlContent(e.target.value)}
              placeholder="Or paste raw RFC 822 / MIME email headers and body directly here...
From: ...
To: ...
Subject: ...
Authentication-Results: ...
Received: ..."
              className="w-full p-3.5 rounded-lg bg-surface border border-surface-border text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-all resize-y min-h-[140px]"
            />
          </div>
        )}

        {/* MODE C: DEDICATED URL INVESTIGATION */}
        {mode === "url" && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Link2 className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-slate-200">
                Isolated URL & Domain Security Inspection
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400 mb-3 flex items-start space-x-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong>Safe Inspection Policy:</strong> Destination URLs are{" "}
                <strong>NEVER visited or fetched</strong> by our servers. All structural
                checks (SSRF protection, punycode, typosquatting, shorteners) run in an isolated offline sandbox.
              </div>
            </div>

            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Enter URL to inspect, e.g. http://bankofamerica.com.account-verify.xyz/login"
              className="w-full text-xs font-mono p-3 rounded-lg bg-surface border border-surface-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>
        )}

        {/* MODE D: SCREENSHOT OCR */}
        {mode === "screenshot" && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-slate-200">
                Screenshot OCR Investigation (On-Device)
              </span>
            </div>

            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div
              onClick={() => imageInputRef.current?.click()}
              className="p-5 rounded-lg border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-900/50 cursor-pointer flex flex-col items-center justify-center text-center transition-colors mb-3"
            >
              <Upload className="w-6 h-6 text-cyan-400 mb-1.5" />
              <span className="text-xs font-semibold text-slate-200">
                Click to upload screenshot (SMS, WhatsApp, Email, Notification)
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                On-device OCR runs locally in your browser • Image is never sent to third-party cloud
              </span>
            </div>

            {/* OCR Progress Indicator */}
            {ocrLoading && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 mb-3 flex items-center space-x-3 text-xs text-cyan-300 font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Running browser OCR engine... ({ocrProgress}%)</span>
              </div>
            )}

            {/* Extracted text preview & edit area */}
            {ocrExtractedText && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Extracted Text (Review & Correct OCR Mistakes Before Submitting):
                </label>
                <textarea
                  rows={5}
                  value={ocrExtractedText}
                  onChange={(e) => setOcrExtractedText(e.target.value)}
                  className="w-full p-3 rounded-lg bg-surface border border-surface-border text-slate-100 text-xs font-sans focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>
        )}

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
            disabled={isLoading}
            className="w-full sm:w-auto px-3.5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Input</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || ocrLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Running Multi-Engine Pipeline...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>Execute Deep Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
