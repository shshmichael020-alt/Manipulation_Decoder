import { PhishingIndicator, FindingSeverity } from "@/types/analyzer";

interface IndicatorRule {
  id: string;
  type:
    | "CREDENTIALS"
    | "IMPERSONATION"
    | "FINANCIAL"
    | "SECURITY_BYPASS"
    | "AUTHENTICATION"
    | "URGENCY"
    | "SUSPICIOUS_ATTACHMENT";
  title: string;
  severity: FindingSeverity;
  regexPatterns: RegExp[];
  details: string;
  defensiveGuidance: string;
}

const PHISHING_RULES: IndicatorRule[] = [
  {
    id: "phish_otp_harvest",
    type: "CREDENTIALS",
    title: "Explicit Request for OTP or MFA Passcode",
    severity: "CRITICAL",
    regexPatterns: [
      /(?:send|share|provide|confirm|verify|enter|text me|input)\s+(?:your\s+|the\s+)?(?:6-digit|one-time|otp|mfa|2fa|verification\s+code|security\s+code)/i,
      /(?:enter|provide|submit|share|verify)\s+(?:your\s+|the\s+)?(?:6-digit\s+)?(?:verification\s+code|otp|passcode)/i,
      /(?:code\s+sent\s+to\s+your\s+(?:phone|mobile|email)|reply\s+with\s+the\s+code)/i,
    ],
    details:
      "The message explicitly asks the recipient to share a multi-factor authentication (MFA) or One-Time Passcode (OTP).",
    defensiveGuidance:
      "Under no circumstances share an OTP. Authentication codes are meant solely for you to enter into trusted login screens.",
  },
  {
    id: "phish_password_request",
    type: "CREDENTIALS",
    title: "Direct Password or Credential Submission Prompt",
    severity: "CRITICAL",
    regexPatterns: [
      /(?:confirm|verify|update|enter|submit)\s+(?:your\s+)?(?:current\s+)?(?:password|pin|master\s+key|login\s+credentials)/i,
      /(?:re-enter\s+your\s+credentials\s+to\s+avoid\s+lockout)/i,
    ],
    details:
      "Direct solicitation of account passwords or confidential access credentials.",
    defensiveGuidance:
      "Never submit passwords in response to email, SMS, or direct messages. Navigate manually to the authentic platform login portal.",
  },
  {
    id: "phish_account_takeover_threat",
    type: "AUTHENTICATION",
    title: "Coerced Security Verification / Suspension Warning",
    severity: "HIGH",
    regexPatterns: [
      /(?:unauthorized\s+(?:login|activity|access|transaction)\s+detected)/i,
      /(?:account\s+(?:temporarily\s+)?(?:locked|restricted|suspended)\s+until\s+you\s+verify)/i,
      /(?:click\s+here\s+to\s+(?:verify|restore|reactivate)\s+your\s+account)/i,
    ],
    details:
      "Claims that security issues require immediate external verification to prevent loss of account access.",
    defensiveGuidance:
      "Legitimate platforms do not require you to click arbitrary verification links. Check account status inside the official app or website.",
  },
  {
    id: "phish_delivery_impersonation",
    type: "IMPERSONATION",
    title: "Delivery / Parcel Logistics Impersonation",
    severity: "HIGH",
    regexPatterns: [
      /(?:usps|ups|fedex|dhl|royal\s+mail|parcel|package\s+delivery)\s+(?:is\s+pending|could\s+not\s+be\s+delivered|held\s+at\s+terminal)/i,
      /(?:pay\s+(?:a\s+small\s+)?(?:redelivery|customs|handling)\s+fee)/i,
      /(?:update\s+your\s+delivery\s+address\s+to\s+receive)/i,
    ],
    details:
      "Impersonates a major courier or postal service to solicit credit card details or malware downloads under the guise of an undelivered parcel.",
    defensiveGuidance:
      "Check tracking numbers directly on the courier's official portal. Never click SMS or email links regarding unrequested deliveries.",
  },
  {
    id: "phish_tech_support_scam",
    type: "IMPERSONATION",
    title: "Technical Support / Helpdesk Impersonation",
    severity: "HIGH",
    regexPatterns: [
      /(?:microsoft\s+support|apple\s+support|it\s+helpdesk|system\s+administrator|geek\s+squad)/i,
      /(?:call\s+(?:our\s+)?toll-free\s+(?:support\s+)?number|virus\s+detected\s+call\s+now)/i,
      /(?:install\s+(?:anydesk|teamviewer|remote\s+access|zoho\s+assist))/i,
    ],
    details:
      "Poses as technical support personnel instructing the target to call a fake call center or install remote desktop access software.",
    defensiveGuidance:
      "Never install remote management software requested by an unsolicited caller or message. Major tech vendors never proactively send warning messages demanding phone calls.",
  },
  {
    id: "phish_unusual_payment",
    type: "FINANCIAL",
    title: "Untraceable / Unconventional Payment Demands",
    severity: "HIGH",
    regexPatterns: [
      /(?:payment\s+via\s+(?:bitcoin|crypto|usdt|ethereum|gift\s+card))/i,
      /(?:wire\s+the\s+amount\s+to\s+(?:an\s+offshore|new)\s+account)/i,
      /(?:purchase\s+\d+\s+(?:apple|google\s+play|steam|amazon)\s+gift\s+cards?)/i,
    ],
    details:
      "Solicits payments via irreversible, untraceable methods such as retail gift cards, cryptocurrency, or rogue wire accounts.",
    defensiveGuidance:
      "No legitimate business or government body accepts gift cards or cryptocurrency as settlement for official dues or invoices.",
  },
  {
    id: "phish_channel_switch",
    type: "IMPERSONATION",
    title: "Request to Move Communication to Unmonitored Channel",
    severity: "MEDIUM",
    regexPatterns: [
      /(?:message\s+me\s+on\s+whatsapp|contact\s+me\s+via\s+telegram|text\s+my\s+personal\s+number)/i,
      /(?:switch\s+to\s+(?:signal|whatsapp|telegram)\s+for\s+privacy)/i,
      /(?:reach\s+out\s+on\s+my\s+private\s+email)/i,
    ],
    details:
      "Attempts to move communication away from monitored corporate email systems or official platform messaging channels.",
    defensiveGuidance:
      "Stay on official platforms. Attackers migrate targets to encrypted messaging apps to evade corporate DLP (data loss prevention) filters.",
  },
  {
    id: "phish_suspicious_attachment",
    type: "SUSPICIOUS_ATTACHMENT",
    title: "Lure to Open Unverified Attachment or Macro File",
    severity: "MEDIUM",
    regexPatterns: [
      /(?:open\s+(?:the\s+)?attached\s+(?:invoice|remittance|receipt|statement|document|pdf|zip))/i,
      /(?:enable\s+macros|enable\s+content\s+to\s+view)/i,
      /(?:download\s+the\s+attached\s+proof\s+of\s+payment)/i,
    ],
    details:
      "Urges opening an attached document, frequently loaded with weaponized macros, malicious scripts, or infostealers.",
    defensiveGuidance:
      "Never enable macros or open unexpected attachments from unverified sources. Upload suspicious files to sandboxes or contact IT security.",
  },
  {
    id: "phish_security_control_bypass",
    type: "SECURITY_BYPASS",
    title: "Explicit Request to Disable Protective Controls",
    severity: "CRITICAL",
    regexPatterns: [
      /(?:disable\s+your\s+(?:antivirus|firewall|defender|security\s+software))/i,
      /(?:add\s+(?:an?\s+)?exception\s+in\s+your\s+antivirus)/i,
      /(?:ignore\s+the\s+(?:browser|windows)\s+warning)/i,
    ],
    details:
      "Explicitly instructs the user to disable endpoint security software or ignore operating system quarantine warnings.",
    defensiveGuidance:
      "Never disable endpoint defense mechanisms. Security warnings indicate that an executable or domain has triggered heuristic or signature defenses.",
  },
];

export interface PhishingAnalysisResult {
  hasCredentialHarvesting: boolean;
  hasImpersonation: boolean;
  hasFinancialPressure: boolean;
  hasSecurityBypass: boolean;
  hasSuspiciousLinks: boolean;
  findings: PhishingIndicator[];
}

export function analyzePhishingAndSocialEngineering(
  text: string,
  hasSuspiciousUrls: boolean
): PhishingAnalysisResult {
  const findings: PhishingIndicator[] = [];

  let hasCredentialHarvesting = false;
  let hasImpersonation = false;
  let hasFinancialPressure = false;
  let hasSecurityBypass = false;

  for (const rule of PHISHING_RULES) {
    for (const pattern of rule.regexPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (rule.type === "CREDENTIALS") hasCredentialHarvesting = true;
        if (rule.type === "IMPERSONATION") hasImpersonation = true;
        if (rule.type === "FINANCIAL") hasFinancialPressure = true;
        if (rule.type === "SECURITY_BYPASS") hasSecurityBypass = true;

        findings.push({
          id: rule.id,
          indicatorType: rule.type,
          title: rule.title,
          severity: rule.severity,
          details: rule.details,
          evidence: match[0],
          defensiveGuidance: rule.defensiveGuidance,
          detectionSource: "RULE_ENGINE",
          isDirectlyObserved: true,
        });
        break; // Match rule once
      }
    }
  }

  return {
    hasCredentialHarvesting,
    hasImpersonation,
    hasFinancialPressure,
    hasSecurityBypass,
    hasSuspiciousLinks: hasSuspiciousUrls,
    findings,
  };
}
