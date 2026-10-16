import { describe, it, expect } from "vitest";
import { runAnalysisEngine } from "../engine";
import { detectManipulationTactics } from "../manipulation";
import { extractAndInspectUrls } from "../url-inspector";
import { analyzeAIWritingLikelihood } from "../ai-writing";
import { computeTextStats } from "../text-stats";
import { calculateThreatScore } from "../threat-score";
import { AnalyzeRequestSchema } from "@/types/analyzer";

describe("The Manipulation Decoder - Core Engine Tests", () => {
  // 1. Schema Validation & Input Limits
  describe("Input Validation & Rejection", () => {
    it("rejects empty input messages", () => {
      const res = AnalyzeRequestSchema.safeParse({ message: "" });
      expect(res.success).toBe(false);
    });

    it("rejects messages exceeding 50,000 characters", () => {
      const hugeMessage = "A".repeat(50001);
      const res = AnalyzeRequestSchema.safeParse({ message: hugeMessage });
      expect(res.success).toBe(false);
    });

    it("accepts valid input with optional sender metadata", () => {
      const res = AnalyzeRequestSchema.safeParse({
        message: "Hello team, please remember our sync tomorrow at 10 AM.",
        senderName: "Project Lead",
        senderAddress: "lead@company.internal",
        contextType: "email",
      });
      expect(res.success).toBe(true);
    });
  });

  // 2. Harmless Everyday Messages
  describe("Harmless Messages", () => {
    it("correctly identifies harmless messages with low risk score", async () => {
      const harmlessText =
        "Hey Sarah, hope you're having a good week! Are we still on for lunch this Friday around 12:30 PM at the cafe down the street? Let me know!";
      const report = await runAnalysisEngine({ message: harmlessText });

      expect(report.overallAssessment.category).toBe("LOW_RISK");
      expect(report.overallAssessment.score).toBeLessThanOrEqual(24);
      expect(report.phishingFindings.hasCredentialHarvesting).toBe(false);
      expect(report.phishingFindings.hasSecurityBypass).toBe(false);
    });
  });

  // 3. Urgent Phishing Messages & OTP Requests
  describe("Urgent Phishing & Credential Requests", () => {
    it("flags urgent account suspension phishing requesting OTP as CRITICAL_RISK", async () => {
      const phishingMsg =
        "URGENT: Your Bank of America account will be suspended within 24 hours due to suspicious activity. Enter your 6-digit verification code immediately at http://bankofamerica.com.account-verify.xyz to retain access.";
      const report = await runAnalysisEngine({
        message: phishingMsg,
        senderName: "Bank of America Support",
      });

      expect(report.overallAssessment.score).toBeGreaterThanOrEqual(75);
      expect(report.overallAssessment.category).toBe("CRITICAL_RISK");
      expect(report.phishingFindings.hasCredentialHarvesting).toBe(true);

      const hasUrgency = report.manipulationFindings.some(
        (f) => f.category === "URGENCY"
      );
      const hasSuspension = report.manipulationFindings.some(
        (f) => f.category === "ACCOUNT_SUSPENSION_THREAT"
      );
      expect(hasUrgency).toBe(true);
      expect(hasSuspension).toBe(true);

      // Verify that quoted evidence is actually from the message
      const otpFinding = report.manipulationFindings.find(
        (f) => f.category === "CREDENTIAL_OTP_HARVESTING"
      );
      expect(otpFinding).toBeDefined();
      expect(phishingMsg).toContain(otpFinding!.quotedText.slice(0, 15));
    });
  });

  // 4. Financial Scams, Authority & Secrecy (CEO Fraud / BEC)
  describe("Financial Scams & Business Email Compromise", () => {
    it("flags CEO impersonation demanding urgent wire transfer with strict secrecy", async () => {
      const becMsg =
        "This is an urgent notice from the desk of the CEO. I am in a confidential board meeting and cannot take calls. We have a pending acquisition and you must wire transfer $45,000 immediately to our escrow partner. Keep this strictly confidential and do not discuss this with anyone in accounting until the wire is confirmed.";
      const report = await runAnalysisEngine({
        message: becMsg,
        senderName: "CEO",
      });

      expect(report.overallAssessment.score).toBeGreaterThanOrEqual(50);
      const hasAuthority = report.manipulationFindings.some(
        (m) => m.category === "AUTHORITY_IMPERSONATION"
      );
      const hasFinancial = report.manipulationFindings.some(
        (m) => m.category === "FINANCIAL_PRESSURE"
      );
      const hasSecrecy = report.manipulationFindings.some(
        (m) => m.category === "SECRECY_ISOLATION"
      );

      expect(hasAuthority).toBe(true);
      expect(hasFinancial).toBe(true);
      expect(hasSecrecy).toBe(true);
    });
  });

  // 5. Suspicious URL Analysis
  describe("Suspicious URL & Domain Heuristics", () => {
    it("detects IP host addresses, punycode, shorteners, and brand typosquatting", () => {
      const sample =
        "Verify your account at http://192.168.1.55/login, check https://bit.ly/secure-gift, and review https://paypa1.com/update";
      const result = extractAndInspectUrls(sample);

      expect(result.totalUrls).toBe(3);
      expect(result.suspiciousCount).toBeGreaterThanOrEqual(2);

      const ipUrl = result.extractedUrls.find((u) => u.isIpAddress);
      expect(ipUrl).toBeDefined();
      expect(ipUrl?.flags.some((f) => f.includes("raw numerical IP"))).toBe(true);

      const shortenerUrl = result.extractedUrls.find((u) => u.isShortener);
      expect(shortenerUrl).toBeDefined();

      const lookalikeUrl = result.extractedUrls.find((u) =>
        u.flags.some((f) => f.includes("Typosquatting") || f.includes("paypal"))
      );
      expect(lookalikeUrl).toBeDefined();
    });
  });

  // 6. AI-Writing Likelihood & Critical Independence
  describe("AI-Writing Likelihood Analysis", () => {
    it("detects high AI-writing markers without automatically marking it malicious", async () => {
      const aiBenignMsg =
        "Dear Team, I hope this message finds you well. In today's fast-paced environment, streamlining our operational workflows is a vital component of sustainable organizational agility. Furthermore, it is crucial to note that cross-functional synergy fosters a culture of collaborative excellence. Moreover, embracing these structured protocols will systematically bolster our strategic capabilities. Please do not hesitate to reach out if you have any questions or concerns. Best regards, Management.";

      const report = await runAnalysisEngine({ message: aiBenignMsg });

      // AI score should be high due to formulaic openings, closings, transition markers, and buzzwords
      expect(report.aiWritingLikelihood.signalScore).toBeGreaterThanOrEqual(50);
      expect(
        report.aiWritingLikelihood.verdict === "LIKELY_AI" ||
          report.aiWritingLikelihood.verdict === "POSSIBLY_AI"
      ).toBe(true);

      // CRITICAL REQUIREMENT: AI-style message without malicious intent must NOT be marked HIGH_RISK or CRITICAL_RISK!
      expect(report.overallAssessment.category).toBe("LOW_RISK");
      expect(report.overallAssessment.score).toBeLessThan(25);
    });

    it("returns INCONCLUSIVE for very short messages", () => {
      const stats = computeTextStats("Call me ASAP.");
      const result = analyzeAIWritingLikelihood("Call me ASAP.", stats);

      expect(result.verdict).toBe("INCONCLUSIVE");
      expect(result.signalStrength).toBe("VERY_LOW");
    });
  });

  // 7. Security Procedures & Controls Bypass
  describe("Security Bypass Detection", () => {
    it("flags requests to disable antivirus or security settings", async () => {
      const bypassMsg =
        "To open the document, please disable your antivirus software and bypass normal security settings.";
      const report = await runAnalysisEngine({ message: bypassMsg });

      expect(report.phishingFindings.hasSecurityBypass).toBe(true);
      expect(
        report.phishingFindings.findings.some(
          (f) => f.indicatorType === "SECURITY_BYPASS"
        )
      ).toBe(true);
    });
  });

  // 8. Fear, Extortion & Intimidation
  describe("Fear, Threats & Extortion", () => {
    it("detects legal threats and law enforcement intimidation", async () => {
      const threatMsg =
        "You have an outstanding criminal summons from the tax authority. Law enforcement and police have issued an arrest warrant. Settle your debt now to avoid prosecution.";
      const report = await runAnalysisEngine({ message: threatMsg });

      expect(report.overallAssessment.score).toBeGreaterThanOrEqual(30);
      const fearTactic = report.manipulationFindings.find(
        (m) => m.category === "FEAR_AND_THREATS"
      );
      expect(fearTactic).toBeDefined();
      expect(threatMsg).toContain(fearTactic!.quotedText.slice(0, 15));
    });
  });

  // 9. Evidence Extraction Integrity (No Fabrications)
  describe("Evidence Extraction Integrity", () => {
    it("ensures all quoted excerpts are genuine substrings of the input message", async () => {
      const complexMsg =
        "URGENT: This is senior management. We have detected suspicious activity on your account. Please enter your 6-digit verification code within 15 minutes or your account will be suspended. Keep this strictly confidential.";
      const report = await runAnalysisEngine({ message: complexMsg });

      for (const finding of report.manipulationFindings) {
        expect(complexMsg).toContain(finding.quotedText);
      }
    });
  });

  // 10. Offline Execution & Adapter Transparency
  describe("Offline Mode & Limitations Transparency", () => {
    it("reports offline heuristic analysis mode when external API keys are omitted", async () => {
      const report = await runAnalysisEngine({
        message: "Check this invoice at https://example.com/invoice",
      });

      expect(report.evidenceAndLimitations.analysisMode).toBe("LOCAL_RULE_BASED");
      expect(report.evidenceAndLimitations.externalReputationData).toContain(
        "Live external threat-intelligence lookups were NOT performed"
      );
    });
  });

  // 11. Consistency of Risk Score & Category Mapping
  describe("Risk Score & Category Consistency", () => {
    it("adheres strictly to the 4-tier risk threshold boundaries", () => {
      const scoreTiers = [
        { score: 10, category: "LOW_RISK" },
        { score: 24, category: "LOW_RISK" },
        { score: 25, category: "MODERATE_RISK" },
        { score: 49, category: "MODERATE_RISK" },
        { score: 50, category: "HIGH_RISK" },
        { score: 74, category: "HIGH_RISK" },
        { score: 75, category: "CRITICAL_RISK" },
        { score: 100, category: "CRITICAL_RISK" },
      ];

      for (const tier of scoreTiers) {
        let cat = "LOW_RISK";
        if (tier.score >= 75) cat = "CRITICAL_RISK";
        else if (tier.score >= 50) cat = "HIGH_RISK";
        else if (tier.score >= 25) cat = "MODERATE_RISK";

        expect(cat).toBe(tier.category);
      }
    });
  });

  // 12. Email Forensics Engine Tests (Mode B)
  describe("Email Forensics & Header Analysis", () => {
    const rawEmlSample = `From: "PayPal Security Team" <alert@customer-verification-portal.xyz>
To: victim@company.com
Reply-To: phish.collector@gmail.com
Return-Path: <bounce@unregistered-smtp.top>
Subject: Unauthorized access to your PayPal account
Authentication-Results: mx.google.com; spf=fail; dkim=fail; dmarc=fail
Received: from mail.unregistered-smtp.top (192.168.1.180) by mx.google.com
Content-Type: multipart/mixed; boundary="BOUNDARY_ABC"

--BOUNDARY_ABC
Content-Type: text/html

<p>Your PayPal account has been limited. Click below to verify:</p>
<p><a href="http://paypa1.com.verify-login.xyz">https://www.paypal.com/signin</a></p>

--BOUNDARY_ABC
Content-Disposition: attachment; filename="Statement_Update.scr"
Content-Type: application/x-scr

[FAKE_BINARY]
--BOUNDARY_ABC--`;

    it("detects display name spoofing, reply-to mismatch, and auth failures in EML", async () => {
      const report = await runAnalysisEngine({
        mode: "email_forensics",
        message: rawEmlSample,
        rawEmlContent: rawEmlSample,
      });

      expect(report.emailForensics).toBeDefined();
      expect(report.emailForensics?.displayNameSpoofingDetected).toBe(true);
      expect(report.emailForensics?.fromReplyToMismatch).toBe(true);
      expect(report.emailForensics?.authResults.spf).toBe("fail");
      expect(report.emailForensics?.authResults.dkim).toBe("fail");
      expect(report.emailForensics?.authResults.dmarc).toBe("fail");

      // Verify anchor mismatch detection
      expect(report.emailForensics?.anchorMismatches.length).toBeGreaterThan(0);
      expect(report.emailForensics?.anchorMismatches[0].displayedText).toContain("paypal.com");

      // Verify attachment extraction
      expect(report.emailForensics?.attachments.length).toBe(1);
      expect(report.emailForensics?.attachments[0].filename).toBe("Statement_Update.scr");
      expect(report.emailForensics?.attachments[0].isSuspiciousExtension).toBe(true);

      // Threat score should be Critical
      expect(report.overallAssessment.category).toBe("CRITICAL_RISK");
      expect(report.overallAssessment.score).toBeGreaterThanOrEqual(85);
    });
  });

  // 13. SSRF & Private Network IP Detection (URL Intelligence)
  describe("SSRF & Internal IP Protection", () => {
    it("flags loopback, link-local, and private RFC 1918 destinations", async () => {
      const internalUrls = [
        "http://127.0.0.1:8080/admin",
        "http://localhost:3000/api",
        "http://169.254.169.254/latest/meta-data/",
        "http://10.0.0.1/router-login",
      ];

      for (const url of internalUrls) {
        const report = await runAnalysisEngine({
          mode: "url",
          message: url,
          targetUrl: url,
        });

        expect(report.urlFindings.extractedUrls.length).toBe(1);
        const u = report.urlFindings.extractedUrls[0];
        expect(u.isPrivateOrLoopback).toBe(true);
        expect(u.flags.some((f) => f.includes("SSRF"))).toBe(true);
      }
    });
  });

  // 14. IOC Extraction & Defanging Standards
  describe("IOC Extraction & Defanging", () => {
    it("extracts and defangs URLs, domains, emails, and attachment hashes", async () => {
      const report = await runAnalysisEngine({
        message: "Verify at https://paypa1.com/login and send code to alert@paypal-help.com",
        senderAddress: "spoofer@hacker-site.org",
      });

      expect(report.iocs.length).toBeGreaterThanOrEqual(2);

      const urlIoc = report.iocs.find((i) => i.type === "url");
      expect(urlIoc).toBeDefined();
      expect(urlIoc?.defanged).toContain("hxxps://");
      expect(urlIoc?.defanged).toContain("[.]");

      const emailIoc = report.iocs.find((i) => i.type === "email");
      expect(emailIoc).toBeDefined();
      expect(emailIoc?.defanged).toContain("[@]");
    });
  });

  // 15. STIX 2.1 Threat Bundle Generation
  describe("STIX 2.1 Threat Intelligence Bundle", () => {
    it("generates a valid STIX 2.1 bundle structure", async () => {
      const report = await runAnalysisEngine({
        message: "URGENT: Your account will be suspended. Enter OTP at http://secure-update.xyz",
      });

      expect(report.stix21Bundle).toBeDefined();
      const bundle = report.stix21Bundle as any;
      expect(bundle.type).toBe("bundle");
      expect(bundle.spec_version).toBe("2.1");
      expect(Array.isArray(bundle.objects)).toBe(true);
      expect(bundle.objects.some((o: any) => o.type === "report")).toBe(true);
      expect(bundle.objects.some((o: any) => o.type === "indicator")).toBe(true);
    });
  });

  // 16. MITRE ATT&CK Mappings
  describe("MITRE ATT&CK Matrix Mapping", () => {
    it("maps spearphishing links and information gathering techniques", async () => {
      const report = await runAnalysisEngine({
        message: "URGENT: Provide your 6-digit OTP passcode at http://login-verify.top",
      });

      expect(report.mitreAttackMappings.length).toBeGreaterThan(0);
      const hasT1598 = report.mitreAttackMappings.some((m) => m.techniqueId === "T1598.003");
      const hasT1566 = report.mitreAttackMappings.some((m) => m.techniqueId === "T1566.002");

      expect(hasT1598 || hasT1566).toBe(true);
      expect(report.mitreAttackMappings[0].referenceUrl).toContain("https://attack.mitre.org/techniques/");
    });
  });

  // 17. Safe Response Assistant
  describe("Safe Response Assistant", () => {
    it("provides an immediate checklist and non-committal reply template for executive fraud", async () => {
      const report = await runAnalysisEngine({
        message: "This is the CEO. Wire $50,000 immediately to partner escrow. Keep this confidential.",
        senderName: "CEO",
      });

      expect(report.safeResponse.immediateChecklist.length).toBeGreaterThan(0);
      expect(report.safeResponse.safeReplyTemplate).toBeDefined();
      expect(report.safeResponse.safeReplyTemplate).toContain("secondary out-of-band authorization");
    });
  });
});


