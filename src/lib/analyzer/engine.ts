import {
  AnalyzeRequest,
  AnalysisReport,
  ExtractedUrlFinding,
  PhishingIndicator,
} from "@/types/analyzer";
import { computeTextStats } from "./text-stats";
import { analyzeAIWritingLikelihood } from "./ai-writing";
import { detectManipulationTactics } from "./manipulation";
import { extractAndInspectUrls } from "./url-inspector";
import { inspectUrlDetailed } from "./url-intelligence";
import { analyzePhishingAndSocialEngineering } from "./phishing";
import { calculateThreatScore } from "./threat-score";
import { parseAndAnalyzeEmail } from "./email-forensics";
import { generateMitreAttackMappings, getWhyThisMightWorkExplanation } from "./mitre-attack";
import { extractIOCs, generateSTIX21Bundle } from "./ioc-stix";
import { enrichWithThreatIntelligence } from "./threat-intel";
import { generateSafeResponseGuidance } from "./safe-response";
import { getExternalAdapterStatus } from "./optional-adapter";

export async function runAnalysisEngine(
  input: AnalyzeRequest
): Promise<AnalysisReport> {
  const {
    mode = "message",
    message,
    senderName,
    senderAddress,
    contextType,
    rawEmlContent,
    targetUrl,
  } = input;

  const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = new Date().toISOString();

  // 1. Safe Email Forensics (If EML content provided or mode is email_forensics)
  let emailForensics = undefined;
  let effectiveMessage = message;

  if (mode === "email_forensics" || rawEmlContent) {
    const emlToParse = rawEmlContent || message;
    emailForensics = parseAndAnalyzeEmail(emlToParse);
    // If user uploaded full EML, extract the text/html body portion for text linguistic analysis
    if (!effectiveMessage || effectiveMessage.length < 10) {
      effectiveMessage = emlToParse;
    }
  }

  // 2. Compute Linguistic Statistics
  const stats = computeTextStats(effectiveMessage);

  // 3. Perform AI-Writing Likelihood Assessment (Heuristic)
  const aiWritingLikelihood = analyzeAIWritingLikelihood(effectiveMessage, stats);

  // 4. URL & Domain Intelligence Extraction
  let extractedUrls: ExtractedUrlFinding[] = [];

  if (mode === "url" && (targetUrl || message)) {
    const singleUrl = targetUrl || message.trim();
    extractedUrls = [inspectUrlDetailed(singleUrl, senderName)];
  } else {
    // Extract all URLs from message
    const urlInspection = extractAndInspectUrls(effectiveMessage, senderName);
    extractedUrls = urlInspection.extractedUrls.map((u) =>
      inspectUrlDetailed(u.rawUrl, senderName)
    );
  }

  // Also include any anchor hrefs extracted from email forensics
  if (emailForensics && emailForensics.anchorMismatches.length > 0) {
    for (const anchor of emailForensics.anchorMismatches) {
      if (!extractedUrls.some((u) => u.rawUrl === anchor.actualHref)) {
        extractedUrls.push(inspectUrlDetailed(anchor.actualHref, senderName));
      }
    }
  }

  // 5. Psychological Manipulation Analysis (13 Categories)
  const manipulationFindings = detectManipulationTactics(effectiveMessage);

  // Calculate distinct Manipulation Index (0-100)
  const manipulationScore = Math.min(
    100,
    manipulationFindings.reduce((acc, curr) => {
      const weight = curr.severity === "CRITICAL" ? 30 : curr.severity === "HIGH" ? 20 : 12;
      return acc + weight;
    }, 0)
  );

  // 6. Phishing & Social Engineering Heuristics
  const suspiciousUrlCount = extractedUrls.filter((u) => u.riskScore >= 25).length;
  const phishingAnalysis = analyzePhishingAndSocialEngineering(
    effectiveMessage,
    suspiciousUrlCount > 0
  );

  const phishingIndicators: PhishingIndicator[] = [...phishingAnalysis.findings];

  // Incorporate email header anomalies into phishing indicators
  if (emailForensics && emailForensics.isAvailable) {
    if (emailForensics.displayNameSpoofingDetected) {
      phishingIndicators.push({
        id: "phish_display_name_spoof",
        indicatorType: "IMPERSONATION",
        title: "Display Name Spoofing Detected",
        severity: "HIGH",
        details: emailForensics.claimedBrandMismatch || "Display name mimics known brand while sender domain is untrusted.",
        evidence: `From: ${emailForensics.headers.from || ""}`,
        defensiveGuidance: "Inspect the raw email address enclosed in brackets rather than trusting the friendly display name.",
        detectionSource: "HEADER_ANALYZER",
        isDirectlyObserved: true,
      });
    }

    if (emailForensics.authResults.spf === "fail") {
      phishingIndicators.push({
        id: "phish_spf_fail",
        indicatorType: "HEADER_ANOMALY",
        title: "SPF Authentication Check Failed",
        severity: "HIGH",
        details: "Sending IP host is unauthorized by the claimed sender domain SPF record.",
        evidence: emailForensics.authResults.rawAuthHeader || "SPF=fail",
        defensiveGuidance: "SPF failures strongly suggest unauthorized relay or domain spoofing.",
        detectionSource: "HEADER_ANALYZER",
        isDirectlyObserved: true,
      });
    }

    if (emailForensics.authResults.dkim === "fail") {
      phishingIndicators.push({
        id: "phish_dkim_fail",
        indicatorType: "HEADER_ANOMALY",
        title: "DKIM Cryptographic Signature Invalid",
        severity: "HIGH",
        details: "The digital cryptographic signature on this message could not be validated or the content was modified in transit.",
        evidence: "DKIM=fail",
        defensiveGuidance: "Treat unverified signatures as potentially tampered communication.",
        detectionSource: "HEADER_ANALYZER",
        isDirectlyObserved: true,
      });
    }

    if (emailForensics.anchorMismatches.length > 0) {
      phishingIndicators.push({
        id: "phish_anchor_mismatch",
        indicatorType: "ANCHOR_MISMATCH",
        title: "Deceptive Hyperlink Anchor Text Discrepancy",
        severity: "CRITICAL",
        details: emailForensics.anchorMismatches[0].riskAnalysis,
        evidence: `Displayed: ${emailForensics.anchorMismatches[0].displayedText} -> Destination: ${emailForensics.anchorMismatches[0].actualHref}`,
        defensiveGuidance: "Never click hyperlinks whose displayed text contradicts the underlying destination link.",
        detectionSource: "HEADER_ANALYZER",
        isDirectlyObserved: true,
      });
    }

    if (emailForensics.attachments.some((a) => a.isSuspiciousExtension)) {
      const susAttach = emailForensics.attachments.find((a) => a.isSuspiciousExtension)!;
      phishingIndicators.push({
        id: "phish_executable_attachment",
        indicatorType: "SUSPICIOUS_ATTACHMENT",
        title: "High-Risk Executable Attachment Detected",
        severity: "CRITICAL",
        details: `Attachment '${susAttach.filename}' carries a dangerous executable extension capable of malware execution.`,
        evidence: `File: ${susAttach.filename} (SHA-256: ${susAttach.sha256.slice(0, 16)}...)`,
        defensiveGuidance: "Do NOT open, preview, or execute this attachment. Report it immediately to IT security.",
        detectionSource: "HEADER_ANALYZER",
        isDirectlyObserved: true,
      });
    }
  }

  // 7. Calculate Explainable Threat Score
  const hasCredentialsRequest =
    phishingAnalysis.hasCredentialHarvesting ||
    manipulationFindings.some((m) => m.category === "CREDENTIAL_OTP_HARVESTING");

  const threatAssessment = calculateThreatScore(
    manipulationFindings,
    phishingIndicators,
    extractedUrls,
    hasCredentialsRequest
  );

  // If email forensics detected hard SPF/DKIM fail or anchor discrepancy, boost risk
  let finalScore = threatAssessment.score;
  if (emailForensics?.anchorMismatches.length) finalScore = Math.max(finalScore, 85);
  if (emailForensics?.attachments.some((a) => a.isSuspiciousExtension)) finalScore = Math.max(finalScore, 90);
  if (emailForensics?.displayNameSpoofingDetected && finalScore < 50) finalScore += 25;
  finalScore = Math.min(100, finalScore);

  // Re-calibrate category if boosted
  let finalCategory = threatAssessment.category;
  if (finalScore >= 75) finalCategory = "CRITICAL_RISK";
  else if (finalScore >= 50) finalCategory = "HIGH_RISK";
  else if (finalScore >= 25) finalCategory = "MODERATE_RISK";

  // Phishing score (0-100)
  const phishingScore = Math.min(
    100,
    phishingIndicators.reduce((acc, curr) => {
      const w = curr.severity === "CRITICAL" ? 35 : curr.severity === "HIGH" ? 22 : 12;
      return acc + w;
    }, 0)
  );

  // 8. Generate MITRE ATT&CK Mappings
  const mitreAttackMappings = generateMitreAttackMappings(
    manipulationFindings,
    phishingIndicators,
    extractedUrls,
    emailForensics
  );

  // 9. Extract and Defang IOCs
  const iocs = extractIOCs(extractedUrls, emailForensics, senderAddress);

  // 10. Generate Valid STIX 2.1 Bundle
  const stix21Bundle = generateSTIX21Bundle(
    reportId,
    timestamp,
    iocs,
    mitreAttackMappings
  );

  // 11. Threat Intelligence Enrichment
  const threatIntelligence = await enrichWithThreatIntelligence(extractedUrls);

  // 12. Safe Response Guidance & Checklist
  const safeResponse = generateSafeResponseGuidance(
    finalScore,
    manipulationFindings,
    phishingIndicators,
    extractedUrls,
    senderName
  );

  // 13. Technical Evidence & Limitations
  const observedEvidence: string[] = [];
  if (stats.sentenceCount > 0) {
    observedEvidence.push(
      `Analyzed ${stats.wordCount} words across ${stats.sentenceCount} sentence structure(s).`
    );
  }
  if (extractedUrls.length > 0) {
    observedEvidence.push(
      `Extracted ${extractedUrls.length} link destination(s) for offline structural & SSRF safety inspection.`
    );
  }
  if (emailForensics?.isAvailable) {
    observedEvidence.push(
      `Evaluated RFC 822 email headers (${emailForensics.routingHops.length} relay hops, SPF=${emailForensics.authResults.spf}, DKIM=${emailForensics.authResults.dkim}).`
    );
  }
  if (manipulationFindings.length > 0) {
    observedEvidence.push(
      `Identified ${manipulationFindings.length} distinct psychological manipulation tactic(s).`
    );
  }
  if (phishingIndicators.length > 0) {
    observedEvidence.push(
      `Flagged ${phishingIndicators.length} defensive phishing and social engineering indicator(s).`
    );
  }

  const heuristicInferences = [
    `AI-writing score (${aiWritingLikelihood.signalScore}/100) is derived from stylometric metrics (TTR: ${stats.lexicalDiversityTTR}, sentence length std dev: ${stats.sentenceLengthStdDev}w).`,
    `Cybersecurity threat score (${finalScore}/100) is independently calculated from technical indicators, anchor mismatches, and psychological coercion.`,
  ];

  const adapterStatus = getExternalAdapterStatus();

  return {
    id: reportId,
    timestamp,
    mode,
    inputStats: {
      characterCount: stats.characterCount,
      wordCount: stats.wordCount,
      sentenceCount: stats.sentenceCount,
      urlCount: extractedUrls.length,
      attachmentCount: emailForensics?.attachments.length || 0,
    },
    overallAssessment: {
      score: finalScore,
      category: finalCategory,
      verdict: threatAssessment.verdict,
      summary: threatAssessment.summary,
      primaryFactors: threatAssessment.primaryFactors,
      manipulationScore,
      phishingScore,
    },
    aiWritingLikelihood,
    manipulationFindings,
    phishingFindings: {
      hasCredentialHarvesting: phishingAnalysis.hasCredentialHarvesting,
      hasImpersonation: phishingAnalysis.hasImpersonation || Boolean(emailForensics?.displayNameSpoofingDetected),
      hasFinancialPressure: phishingAnalysis.hasFinancialPressure,
      hasSecurityBypass: phishingAnalysis.hasSecurityBypass,
      hasSuspiciousLinks: extractedUrls.some((u) => u.riskScore >= 25),
      findings: phishingIndicators,
    },
    urlFindings: {
      extractedUrls,
      summary: extractedUrls.length > 0
        ? `Inspected ${extractedUrls.length} URL destination(s). ${suspiciousUrlCount} flagged with elevated risk.`
        : "No URLs were found in the submitted input.",
      totalUrls: extractedUrls.length,
      suspiciousCount: suspiciousUrlCount,
    },
    emailForensics,
    iocs,
    mitreAttackMappings,
    threatIntelligence,
    safeResponse,
    recommendedActions: threatAssessment.recommendedActions,
    evidenceAndLimitations: {
      observedEvidence,
      heuristicInferences,
      externalReputationData: adapterStatus.hasVirusTotalKey
        ? "VirusTotal live threat intelligence query enabled."
        : "Live external threat-intelligence lookups were NOT performed (running offline heuristic inspection).",
      analysisMode: adapterStatus.hasGeminiKey
        ? "HYBRID_AI_ASSISTED"
        : "LOCAL_RULE_BASED",
      disclaimer:
        "Automated cybersecurity heuristics provide probabilistic risk signals and cannot guarantee 100% security or definitive authorship attribution. Always exercise independent out-of-band verification.",
    },
    stix21Bundle,
  };
}
