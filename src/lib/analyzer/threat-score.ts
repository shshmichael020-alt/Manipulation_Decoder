import {
  RiskCategory,
  ManipulationFinding,
  PhishingIndicator,
  ExtractedUrlFinding,
  DefenseAction,
} from "@/types/analyzer";

export interface ThreatAssessmentResult {
  score: number;
  category: RiskCategory;
  verdict: string;
  summary: string;
  primaryFactors: string[];
  recommendedActions: DefenseAction[];
}

export function calculateThreatScore(
  manipulationFindings: ManipulationFinding[],
  phishingIndicators: PhishingIndicator[],
  extractedUrls: ExtractedUrlFinding[],
  hasCredentialsRequest: boolean
): ThreatAssessmentResult {
  let score = 0;
  const primaryFactors: string[] = [];
  const recommendedActions: DefenseAction[] = [];

  // 1. Phishing Indicators Weighting
  let hasCriticalPhishing = false;
  for (const ind of phishingIndicators) {
    if (ind.severity === "CRITICAL") {
      score += 35;
      hasCriticalPhishing = true;
      primaryFactors.push(`Critical phishing indicator: ${ind.title}`);
    } else if (ind.severity === "HIGH") {
      score += 20;
      primaryFactors.push(`High phishing risk: ${ind.title}`);
    } else if (ind.severity === "MEDIUM") {
      score += 10;
      primaryFactors.push(`Phishing warning: ${ind.title}`);
    } else {
      score += 5;
    }
  }

  // 2. Psychological Manipulation Weighting
  let hasUrgency = false;
  let hasSuspensionThreat = false;
  let hasSecrecy = false;
  let hasFear = false;

  for (const m of manipulationFindings) {
    if (m.category === "CREDENTIAL_OTP_HARVESTING") {
      score += 30;
      primaryFactors.push("Direct solicitation of authentication credentials/OTP");
    } else if (m.category === "ACCOUNT_SUSPENSION_THREAT") {
      score += 20;
      hasSuspensionThreat = true;
      primaryFactors.push("Threat of imminent account suspension or deactivation");
    } else if (m.category === "URGENCY") {
      score += 15;
      hasUrgency = true;
      primaryFactors.push("Severe artificial urgency and immediate action demands");
    } else if (m.category === "FEAR_AND_THREATS") {
      score += 18;
      hasFear = true;
      primaryFactors.push("Legal retribution or intimidation threats");
    } else if (m.category === "SECRECY_ISOLATION") {
      score += 18;
      hasSecrecy = true;
      primaryFactors.push("Target isolation and explicit demands for secrecy");
    } else if (m.category === "FINANCIAL_PRESSURE") {
      score += 20;
      primaryFactors.push("Irregular financial coercion or cryptocurrency/gift-card payment request");
    } else if (m.category === "AUTHORITY_IMPERSONATION") {
      score += 15;
      primaryFactors.push("Executive or official regulatory authority impersonation");
    } else if (m.category === "BYPASS_PROCEDURES") {
      score += 18;
      primaryFactors.push("Solicitation to bypass standard security procedures");
    } else {
      score += 8;
    }
  }

  // 3. URL and Domain Risk Weighting
  let hasMaliciousUrlIndicators = false;
  let hasLookalikeUrl = false;
  for (const u of extractedUrls) {
    if (u.isLookalikeOrPunycode) {
      score += 25;
      hasLookalikeUrl = true;
      primaryFactors.push(`Deceptive typosquatting/punycode domain: ${u.domain}`);
    }
    if (u.isIpAddress) {
      score += 20;
      primaryFactors.push(`Direct numerical IP host address used: ${u.domain}`);
    }
    if (u.riskScore >= 40) {
      hasMaliciousUrlIndicators = true;
      score += 15;
    } else if (u.riskScore >= 20) {
      score += 8;
    }
  }

  // 4. Compound Multipliers (Threat Synergy)
  // When high-risk tactics combine, the threat multiplies exponentially:
  // E.g. Credential harvesting + Lookalike URL = definite phishing campaign
  if (hasCredentialsRequest && (hasLookalikeUrl || hasMaliciousUrlIndicators)) {
    score += 25;
    primaryFactors.push("Compound risk: Credential harvesting combined with deceptive link destination");
  }
  // Urgency + Suspension Threat = Classic Account Phishing Lure
  if (hasUrgency && hasSuspensionThreat) {
    score += 15;
    primaryFactors.push("Compound risk: Threat of immediate account deactivation reinforced by time pressure");
  }
  // Secrecy + Financial Pressure = Classic Business Email Compromise (BEC)
  if (hasSecrecy && (hasCriticalPhishing || manipulationFindings.some((m) => m.category === "FINANCIAL_PRESSURE"))) {
    score += 20;
    primaryFactors.push("Compound risk: Business Email Compromise pattern (Secrecy + Financial urgency)");
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Category and Verdict
  let category: RiskCategory;
  let verdict: string;
  let summary: string;

  if (finalScore >= 75) {
    category = "CRITICAL_RISK";
    verdict = "Critical warning — strong indicators of phishing or social engineering";
    summary =
      "This message demonstrates multiple acute threat indicators, including direct credential harvesting, aggressive psychological coercion, or brand-spoofing links. Do NOT interact or reply.";
  } else if (finalScore >= 50) {
    category = "HIGH_RISK";
    verdict = "High risk — do not act until verified";
    summary =
      "High probability of social engineering or deceptive manipulation. The sender is attempting to induce compliance through urgent deadlines, intimidation, or irregular payment requests.";
  } else if (finalScore >= 25) {
    category = "MODERATE_RISK";
    verdict = "Suspicious — verify independently";
    summary =
      "Moderate risk detected. While not definitively hostile, the message contains conversational manipulation signals, external links, or unverified claims that warrant independent verification.";
  } else if (finalScore > 5) {
    category = "LOW_RISK";
    verdict = "Exercise caution";
    summary =
      "Low apparent threat, but subtle persuasive cues or generic links were observed. Standard cybersecurity vigilance is advised.";
  } else {
    category = "LOW_RISK";
    verdict = "No major red flags detected";
    summary =
      "No recognized psychological manipulation tactics, credential solicitation, or deceptive URLs were detected in this message.";
  }

  // Build Tailored Recommended Defensive Actions
  if (hasCredentialsRequest || hasCriticalPhishing) {
    recommendedActions.push({
      priority: "IMMEDIATE",
      action: "Never disclose your password, PIN, or One-Time Passcode (OTP)",
      reason:
        "Legitimate organizations, banks, and IT teams will NEVER ask you to reveal or message your authentication codes.",
    });
  }

  if (extractedUrls.length > 0) {
    if (hasMaliciousUrlIndicators || hasLookalikeUrl || finalScore >= 50) {
      recommendedActions.push({
        priority: "IMMEDIATE",
        action: "Do not click any link or button in this message",
        reason:
          "The links exhibit deceptive structural signals or are paired with urgent lures designed to steal account sessions.",
      });
    } else {
      recommendedActions.push({
        priority: "STANDARD",
        action: "Inspect link destinations before clicking",
        reason:
          "Verify that the destination URL matches the official trusted domain of the service before entering any credentials.",
      });
    }
  }

  if (manipulationFindings.some((m) => m.category === "AUTHORITY_IMPERSONATION" || m.category === "FINANCIAL_PRESSURE")) {
    recommendedActions.push({
      priority: "HIGH",
      action: "Confirm through a verified out-of-band communication channel",
      reason:
        "Contact the alleged sender using an independently verified phone number, official corporate directory, or internal chat, NOT the contact info in this message.",
    });
  }

  if (hasSuspensionThreat) {
    recommendedActions.push({
      priority: "HIGH",
      action: "Check account status directly on the official platform",
      reason:
        "Open a fresh browser window, type the official service address manually, and review your account notification center directly.",
    });
  }

  if (finalScore >= 50) {
    recommendedActions.push({
      priority: "STANDARD",
      action: "Report this message to your security team or service provider",
      reason:
        "Reporting suspicious messages enables email gateway admins to block similar attacks across your entire organization.",
    });
    recommendedActions.push({
      priority: "INFO",
      action: "If you already clicked or entered credentials, reset them immediately",
      reason:
        "Navigate to the official portal, change your password immediately, and terminate all active sessions via account security settings.",
    });
  } else {
    recommendedActions.push({
      priority: "INFO",
      action: "Standard defensive posture",
      reason:
        "Even when messages appear harmless, maintain security awareness and avoid executing unsolicited attachments.",
    });
  }

  return {
    score: finalScore,
    category,
    verdict,
    summary,
    primaryFactors: primaryFactors.length > 0 ? primaryFactors : ["No elevated threat signals observed"],
    recommendedActions,
  };
}
