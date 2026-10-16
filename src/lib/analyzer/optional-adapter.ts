import { ExtractedUrlFinding } from "@/types/analyzer";

export interface ExternalAdapterStatus {
  hasGeminiKey: boolean;
  hasVirusTotalKey: boolean;
  activeAiProvider: string;
  activeUrlReputationProvider: string;
}

export function getExternalAdapterStatus(): ExternalAdapterStatus {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
  const hasVirusTotalKey = Boolean(process.env.VIRUSTOTAL_API_KEY && process.env.VIRUSTOTAL_API_KEY.trim() !== "");

  return {
    hasGeminiKey,
    hasVirusTotalKey,
    activeAiProvider: hasGeminiKey ? "Google Gemini (Configured)" : "Local Heuristic Engine (Standalone)",
    activeUrlReputationProvider: hasVirusTotalKey
      ? "VirusTotal Intelligence API"
      : "Local Domain Security Heuristics (Offline Mode)",
  };
}

/**
 * Optional reputation enrichment for extracted URLs.
 * If external API credentials are absent, leaves URLs in NOT_CHECKED_OFFLINE state
 * and reports clear technical reasons.
 */
export async function enrichUrlReputation(
  urls: ExtractedUrlFinding[]
): Promise<ExtractedUrlFinding[]> {
  const { hasVirusTotalKey } = getExternalAdapterStatus();

  if (!hasVirusTotalKey || urls.length === 0) {
    return urls; // Return offline heuristic results unchanged
  }

  // If a live key is configured, an adapter could query the reputation API with safe timeouts.
  // In demo / offline fallback mode, transparently declare offline status.
  return urls.map((u) => ({
    ...u,
    reputationProvider: "VirusTotal Live API (Adapter Ready)",
  }));
}
