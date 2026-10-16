import { ExtractedUrlFinding } from "@/types/analyzer";
import { inspectUrlDetailed } from "./url-intelligence";

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`[\]()]+/gi;

export interface UrlInspectionResult {
  extractedUrls: ExtractedUrlFinding[];
  summary: string;
  totalUrls: number;
  suspiciousCount: number;
}

export function extractAndInspectUrls(
  text: string,
  claimedOrg?: string
): UrlInspectionResult {
  const matches = (text.match(URL_REGEX) || []).map((u) =>
    u.replace(/[.,;:!?)]+$/, "")
  );
  const uniqueUrls = Array.from(new Set(matches));

  const findings: ExtractedUrlFinding[] = uniqueUrls.map((u) =>
    inspectUrlDetailed(u, claimedOrg)
  );

  const suspiciousCount = findings.filter(
    (u) => u.riskScore >= 25 || u.flags.length > 0
  ).length;

  let summary = "No URLs were found in the submitted message.";
  if (findings.length > 0) {
    summary = `Extracted ${findings.length} URL${
      findings.length > 1 ? "s" : ""
    } for offline structural analysis. ${
      suspiciousCount > 0
        ? `${suspiciousCount} exhibited suspicious indicators (e.g. deceptive subdomains, missing HTTPS, or shorteners).`
        : "No high-risk URL anomalies or brand-spoofing patterns were detected in the links."
    }`;
  }

  return {
    extractedUrls: findings,
    summary,
    totalUrls: findings.length,
    suspiciousCount,
  };
}
