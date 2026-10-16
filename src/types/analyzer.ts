import { z } from "zod";

export type InvestigationMode = "message" | "email_forensics" | "url" | "screenshot";

export const AnalyzeRequestSchema = z.object({
  mode: z.enum(["message", "email_forensics", "url", "screenshot"]).optional().default("message"),
  message: z
    .string({ required_error: "Message content is required" })
    .min(1, "Input content cannot be empty")
    .max(50000, "Input exceeds maximum limit of 50,000 characters"),
  senderName: z.string().max(100, "Sender name too long").optional().or(z.literal("")),
  senderAddress: z.string().max(150, "Sender address too long").optional().or(z.literal("")),
  contextType: z.enum(["email", "sms", "chat", "social", "payment", "other"]).optional().default("other"),
  rawEmlContent: z.string().max(200000, "EML content too large").optional(),
  targetUrl: z.string().max(2000, "URL too long").optional(),
  userAgreedToScan: z.boolean().optional().default(true),
});

export type AnalyzeRequest = z.input<typeof AnalyzeRequestSchema>;
export type ValidatedAnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export type RiskCategory = "LOW_RISK" | "MODERATE_RISK" | "HIGH_RISK" | "CRITICAL_RISK";

export type AIWritingVerdict =
  | "LIKELY_AI"
  | "POSSIBLY_AI"
  | "NO_STRONG_SIGNALS"
  | "INCONCLUSIVE";

export type SignalStrength = "VERY_LOW" | "LOW" | "MODERATE" | "HIGH";

export type ManipulationCategory =
  | "URGENCY"
  | "FEAR_AND_THREATS"
  | "AUTHORITY_IMPERSONATION"
  | "FINANCIAL_PRESSURE"
  | "CURIOSITY_AND_BAIT"
  | "SCARCITY"
  | "GUILT_COERCION"
  | "TRUST_EXPLOITATION"
  | "SECRECY_ISOLATION"
  | "SOCIAL_PROOF"
  | "ACCOUNT_SUSPENSION_THREAT"
  | "BYPASS_PROCEDURES"
  | "CREDENTIAL_OTP_HARVESTING";

export type FindingSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ManipulationFinding {
  id: string;
  category: ManipulationCategory;
  tacticName: string;
  severity: FindingSeverity;
  quotedText: string;
  techniqueExplanation: string;
  whyThisMightWork: string;
  riskReason: string;
  recommendedAction: string;
  mitreTechniqueId?: string;
  detectionSource: "RULE_ENGINE" | "HEURISTIC" | "AUTHENTICATION_INSPECTION";
  isDirectlyObserved: boolean;
}

export interface PhishingIndicator {
  id: string;
  indicatorType:
    | "CREDENTIALS"
    | "IMPERSONATION"
    | "FINANCIAL"
    | "SECURITY_BYPASS"
    | "AUTHENTICATION"
    | "URGENCY"
    | "SUSPICIOUS_ATTACHMENT"
    | "HEADER_ANOMALY"
    | "ANCHOR_MISMATCH";
  title: string;
  severity: FindingSeverity;
  details: string;
  evidence: string;
  defensiveGuidance: string;
  mitreTechniqueId?: string;
  detectionSource: "RULE_ENGINE" | "HEADER_ANALYZER" | "HEURISTIC";
  isDirectlyObserved: boolean;
}

export interface ExtractedUrlFinding {
  rawUrl: string;
  domain: string;
  protocol: string;
  isHttps: boolean;
  isIpAddress: boolean;
  isShortener: boolean;
  isLookalikeOrPunycode: boolean;
  isPrivateOrLoopback: boolean;
  nonStandardPort?: number;
  subdomainCount: number;
  suspiciousComponents: string[];
  reputationStatus: "NOT_CHECKED_OFFLINE" | "CLEAN" | "SUSPICIOUS" | "MALICIOUS";
  reputationProvider: string;
  riskScore: number;
  flags: string[];
  defangedUrl: string;
}

export interface AIWritingCharacteristic {
  id: string;
  title: string;
  description: string;
  observedEvidence?: string;
  metricScore?: number;
}

export interface AIWritingAssessment {
  verdict: AIWritingVerdict;
  verdictLabel: string;
  signalStrength: SignalStrength;
  signalScore: number; // 0-100 heuristic signal
  detectedCharacteristics: AIWritingCharacteristic[];
  linguisticMetrics: {
    averageSentenceLength: number;
    sentenceLengthStdDev: number;
    lexicalDiversityTTR: number; // Type-Token Ratio
    formulaicTransitionCount: number;
    uniformityIndex: number; // 0-100
  };
  confidenceNotes: string;
  disclaimer: string;
}

export interface DefenseAction {
  priority: "IMMEDIATE" | "HIGH" | "STANDARD" | "INFO";
  action: string;
  reason: string;
}

export interface EmailAuthenticationResults {
  spf: "pass" | "fail" | "softfail" | "neutral" | "none" | "unknown";
  dkim: "pass" | "fail" | "none" | "unknown";
  dmarc: "pass" | "fail" | "none" | "unknown";
  rawAuthHeader?: string;
  interpretationNotes: string[];
}

export interface EmailRoutingHop {
  hopNumber: number;
  byHost?: string;
  fromHost?: string;
  withProtocol?: string;
  timestamp?: string;
  isSuspicious: boolean;
  note?: string;
}

export interface EmailAttachmentMetadata {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  isSuspiciousExtension: boolean;
  warning?: string;
}

export interface AnchorMismatch {
  displayedText: string;
  actualHref: string;
  riskAnalysis: string;
}

export interface EmailForensicsReport {
  isAvailable: boolean;
  headers: {
    from?: string;
    to?: string;
    replyTo?: string;
    returnPath?: string;
    subject?: string;
    date?: string;
    messageId?: string;
  };
  displayNameSpoofingDetected: boolean;
  fromReplyToMismatch: boolean;
  fromReturnPathMismatch: boolean;
  claimedBrandMismatch?: string;
  authResults: EmailAuthenticationResults;
  routingHops: EmailRoutingHop[];
  headerAnomalies: string[];
  anchorMismatches: AnchorMismatch[];
  attachments: EmailAttachmentMetadata[];
  forensicsSummary: string;
}

export interface MITREAttackMapping {
  techniqueId: string;
  techniqueName: string;
  tactic: string;
  referenceUrl: string;
  observedEvidence: string;
  defensiveMitigation: string;
}

export interface IOCEntry {
  id: string;
  type: "domain" | "url" | "ip" | "hash" | "email";
  raw: string;
  defanged: string;
  severity: FindingSeverity;
  category: string;
  riskScore: number;
}

export interface ThreatIntelligenceEnrichment {
  providerName: string;
  status: "ONLINE_ACTIVE" | "OFFLINE_HEURISTIC" | "CREDENTIALS_MISSING" | "RATE_LIMITED";
  evaluatedEntity: string;
  verdict: "CLEAN" | "SUSPICIOUS" | "MALICIOUS" | "NOT_EVALUATED";
  details: string;
  timestamp: string;
  isCached: boolean;
}

export interface SafeResponseGuidance {
  immediateChecklist: string[];
  safeReplyTemplate?: string;
  verificationInstructions: string[];
}

export interface AnalysisReport {
  id: string;
  timestamp: string;
  mode: InvestigationMode;
  inputStats: {
    characterCount: number;
    wordCount: number;
    sentenceCount: number;
    urlCount: number;
    attachmentCount?: number;
  };
  overallAssessment: {
    score: number; // 0-100
    category: RiskCategory;
    verdict: string;
    summary: string;
    primaryFactors: string[];
    manipulationScore: number;
    phishingScore: number;
  };
  aiWritingLikelihood: AIWritingAssessment;
  manipulationFindings: ManipulationFinding[];
  phishingFindings: {
    hasCredentialHarvesting: boolean;
    hasImpersonation: boolean;
    hasFinancialPressure: boolean;
    hasSecurityBypass: boolean;
    hasSuspiciousLinks: boolean;
    findings: PhishingIndicator[];
  };
  urlFindings: {
    extractedUrls: ExtractedUrlFinding[];
    summary: string;
    totalUrls: number;
    suspiciousCount: number;
  };
  emailForensics?: EmailForensicsReport;
  iocs: IOCEntry[];
  mitreAttackMappings: MITREAttackMapping[];
  threatIntelligence: ThreatIntelligenceEnrichment[];
  safeResponse: SafeResponseGuidance;
  recommendedActions: DefenseAction[];
  evidenceAndLimitations: {
    observedEvidence: string[];
    heuristicInferences: string[];
    externalReputationData: string;
    analysisMode: "LOCAL_RULE_BASED" | "HYBRID_AI_ASSISTED";
    disclaimer: string;
  };
  stix21Bundle?: Record<string, unknown>;
}
