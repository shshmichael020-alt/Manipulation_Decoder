import {
  MITREAttackMapping,
  ManipulationFinding,
  PhishingIndicator,
  ExtractedUrlFinding,
  EmailForensicsReport,
} from "@/types/analyzer";

export function generateMitreAttackMappings(
  manipulationFindings: ManipulationFinding[],
  phishingIndicators: PhishingIndicator[],
  urls: ExtractedUrlFinding[],
  emailForensics?: EmailForensicsReport
): MITREAttackMapping[] {
  const mappings: MITREAttackMapping[] = [];
  const addedTechniques = new Set<string>();

  const addMapping = (
    id: string,
    name: string,
    tactic: string,
    evidence: string,
    mitigation: string
  ) => {
    if (!addedTechniques.has(id)) {
      addedTechniques.add(id);
      mappings.push({
        techniqueId: id,
        techniqueName: name,
        tactic,
        referenceUrl: `https://attack.mitre.org/techniques/${id.replace(".", "/")}/`,
        observedEvidence: evidence,
        defensiveMitigation: mitigation,
      });
    }
  };

  // 1. Phishing for Information: Spearphishing Link (T1598.003)
  const hasCredentialLure = phishingIndicators.some(
    (p) => p.indicatorType === "CREDENTIALS" || p.indicatorType === "AUTHENTICATION"
  );
  const hasUrls = urls.length > 0;

  if (hasCredentialLure && hasUrls) {
    addMapping(
      "T1598.003",
      "Phishing for Information: Spearphishing Link",
      "Reconnaissance / Initial Access",
      `Credential harvesting vector combined with ${urls.length} link destination(s).`,
      "Implement multi-factor authentication (FIDO2/WebAuthn), deploy enterprise URL filtering, and enforce antiphishing mail gateways."
    );
  }

  // 2. Phishing: Spearphishing Link (T1566.002)
  if (hasUrls && (urls.some((u) => u.riskScore >= 30) || hasCredentialLure)) {
    addMapping(
      "T1566.002",
      "Phishing: Spearphishing Link",
      "Initial Access",
      `High-risk link observed: ${urls[0].rawUrl}`,
      "Deploy protective DNS resolvers, automated email link-rewriting sandboxes, and endpoint browser isolation."
    );
  }

  // 3. Phishing: Spearphishing Attachment (T1566.001)
  const hasAttachmentLure =
    phishingIndicators.some((p) => p.indicatorType === "SUSPICIOUS_ATTACHMENT") ||
    (emailForensics && emailForensics.attachments.length > 0);

  if (hasAttachmentLure) {
    const attachDesc =
      emailForensics && emailForensics.attachments.length > 0
        ? `Observed attachment(s): ${emailForensics.attachments.map((a) => a.filename).join(", ")}`
        : "Message body references opening external or attached documents.";

    addMapping(
      "T1566.001",
      "Phishing: Spearphishing Attachment",
      "Initial Access",
      attachDesc,
      "Block high-risk file types at mail gateway, mandate sandbox detonation before delivery, and disable Microsoft Office macro execution by default."
    );
  }

  // 4. Internal Spearphishing / Authority Impersonation (T1534)
  const hasAuthorityOrSecrecy = manipulationFindings.some(
    (m) =>
      m.category === "AUTHORITY_IMPERSONATION" ||
      m.category === "SECRECY_ISOLATION" ||
      m.category === "FINANCIAL_PRESSURE"
  );

  if (hasAuthorityOrSecrecy) {
    addMapping(
      "T1534",
      "Internal Spearphishing",
      "Lateral Movement / Initial Access",
      "Message mimics executive leadership or internal corporate hierarchy to coerce compliance.",
      "Enforce secondary verification protocols for high-value financial transactions and require cryptographically signed internal email communications."
    );
  }

  // 5. User Execution: Malicious Link (T1204.001)
  if (hasUrls && urls.some((u) => u.isLookalikeOrPunycode || u.riskScore >= 40)) {
    addMapping(
      "T1204.001",
      "User Execution: Malicious Link",
      "Execution",
      `Deceptive lookalike/punycode link designed to lure recipient click: ${urls[0].domain}`,
      "Conduct regular simulated phishing resilience exercises and implement safe copy-link mechanisms that preview true destination domain."
    );
  }

  // 6. Security Bypass / Disable Controls (T1562.001)
  const hasBypass = phishingIndicators.some(
    (p) => p.indicatorType === "SECURITY_BYPASS"
  );
  if (hasBypass) {
    addMapping(
      "T1562.001",
      "Impair Defenses: Disable or Modify Tools",
      "Defense Evasion",
      "Message explicitly requests recipient to bypass normal procedures or disable endpoint security.",
      "Enforce tamper protection on antivirus and endpoint detection (EDR) agents to prevent local administrative shutdown."
    );
  }

  return mappings;
}

export function getWhyThisMightWorkExplanation(category: string): string {
  switch (category) {
    case "URGENCY":
      return "Human working memory is quickly saturated under perceived time crises. Time pressure forces brain reliance on intuitive System-1 thinking, bypassing logical verification checks.";
    case "FEAR_AND_THREATS":
      return "Threats of arrest, litigation, or public shame induce acute stress hormones that trigger immediate self-preservation compliance to eliminate the source of discomfort.";
    case "AUTHORITY_IMPERSONATION":
      return "Societal and professional training deeply conditions deference to executives, tax authorities, and law enforcement. Challenging authority feels socially risky.";
    case "FINANCIAL_PRESSURE":
      return "Fear of debt, lost compensation, or corporate operational halts creates strong motivation to expedite payments, especially when paired with senior executive authority.";
    case "ACCOUNT_SUSPENSION_THREAT":
      return "Loss aversion bias makes people fear losing access to email, banking, or corporate tools significantly more than they value exercising caution.";
    case "SECRECY_ISOLATION":
      return "Keeping transactions off-the-record deprives the victim of their natural social sounding board. Without peer validation, fraudulent premises go unchallenged.";
    case "CREDENTIAL_OTP_HARVESTING":
      return "Users encounter legitimate multi-factor authentication routines multiple times per day. Attackers exploit this familiar muscle memory to intercept transient tokens.";
    default:
      return "Social engineering manipulates predictable cognitive heuristics—such as trust, helpfulness, and curiosity—to bypass deliberate scrutiny.";
  }
}
