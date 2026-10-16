"use client";

import React, { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { InputStudio } from "@/components/InputStudio";
import { AnalysisReportView } from "@/components/AnalysisReportView";
import { TrainingLabView } from "@/components/TrainingLabView";
import { CaseHistoryDrawer } from "@/components/CaseHistoryDrawer";
import { EducationalSection } from "@/components/EducationalSection";
import { Footer } from "@/components/Footer";
import { AnalysisReport, AnalyzeRequest } from "@/types/analyzer";
import { saveCaseToHistory } from "@/lib/storage/case-history";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [currentView, setCurrentView] = useState<"studio" | "lab">("studio");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (payload: AnalyzeRequest) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Server responded with error status ${response.status}`
        );
      }

      const data: AnalysisReport = await response.json();
      setReport(data);

      // Save to local browser history if user opted in
      saveCaseToHistory({
        id: data.id,
        timestamp: data.timestamp,
        mode: data.mode,
        verdict: data.overallAssessment.verdict,
        category: data.overallAssessment.category,
        score: data.overallAssessment.score,
        preview: data.manipulationFindings[0]?.quotedText || payload.message.slice(0, 90),
        manipulationCount: data.manipulationFindings.length,
        urlCount: data.urlFindings.totalUrls,
      });

      // Smooth scroll to report view
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error("[Analysis Error]", err);
      setApiError(
        err.message || "An unexpected error occurred while processing the analysis request."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeFromLab = (messageText: string, senderName: string, senderAddress: string) => {
    setCurrentView("studio");
    handleAnalyze({
      mode: "message",
      message: messageText,
      senderName,
      senderAddress,
      contextType: "email",
      userAgreedToScan: true,
    });
  };

  const handleReset = () => {
    setReport(null);
    setApiError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <Navbar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <main className="flex-1 pb-12">
        {currentView === "studio" ? (
          <>
            <Hero />

            {/* 4-Mode Unified Input Studio */}
            <div className="mt-4">
              <InputStudio onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>

            {/* API Error Notification */}
            {apiError && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
                <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-start space-x-3 shadow-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold mb-0.5">Analysis Request Failed</div>
                    <div>{apiError}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Dual-Perspective Security Report View (Protection & Analyst Modes) */}
            {report && (
              <div ref={reportRef} className="scroll-mt-20">
                <AnalysisReportView report={report} onReset={handleReset} />
              </div>
            )}

            {/* Educational Playbook */}
            <EducationalSection />
          </>
        ) : (
          /* Interactive Training Lab View */
          <TrainingLabView onAnalyzeSample={handleAnalyzeFromLab} />
        )}
      </main>

      {/* Local Case History Drawer */}
      <CaseHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <Footer />
    </div>
  );
}
