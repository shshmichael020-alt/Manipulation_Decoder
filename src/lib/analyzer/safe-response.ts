import {
  SafeResponseGuidance,
  ManipulationFinding,
  PhishingIndicator,
  ExtractedUrlFinding,
} from "@/types/analyzer";

export function generateSafeResponseGuidance(
  score: number,
  manipulations: ManipulationFinding[],
  phishing: PhishingIndicator[],
  urls: ExtractedUrlFinding[],
  claimedSender?: string
): SafeResponseGuidance {
  const immediateChecklist: string[] = [];
  const verificationInstructions: string[] = [];

  const hasCredentials = phishing.some(
    (p) => p.indicatorType === "CREDENTIALS" || p.indicatorType === "AUTHENTICATION"
  );
  const hasWireOrFinancial = manipulations.some(
    (m) => m.category === "FINANCIAL_PRESSURE"
  );
  const hasSuspension = manipulations.some(
    (m) => m.category === "ACCOUNT_SUSPENSION_THREAT"
  );
  const hasAuthorityOrSecrecy = manipulations.some(
    (m) => m.category === "AUTHORITY_IMPERSONATION" || m.category === "SECRECY_ISOLATION"
  );

  // Build Checklist
  if (hasCredentials) {
    immediateChecklist.push(
      "DO NOT reply with any One-Time Passcode (OTP), password, PIN, or verification digits."
    );
    immediateChecklist.push(
      "If you already entered credentials on a linked page, change your password immediately on the official website and sign out of all active sessions."
    );
  }

  if (urls.length > 0 && (score >= 40 || urls.some((u) => u.riskScore >= 30))) {
    immediateChecklist.push(
      "DO NOT click any link or button inside the message. Copying and pasting the link into a browser is equally dangerous."
    );
  }

  if (hasWireOrFinancial) {
    immediateChecklist.push(
      "DO NOT initiate any wire transfer, gift card purchase, or cryptocurrency payment based on this message alone."
    );
    immediateChecklist.push(
      "Adhere strictly to corporate dual-authorization accounting protocols."
    );
  }

  if (hasSuspension) {
    immediateChecklist.push(
      "Do not panic over suspension threats. Open an independent browser tab, type the authentic service address manually, and inspect your account status."
    );
  }

  if (immediateChecklist.length === 0) {
    immediateChecklist.push(
      "Standard defensive caution: ensure the sender's actual address matches their identity before sharing sensitive files."
    );
  }

  // Verification instructions
  verificationInstructions.push(
    "Identify a verified secondary channel: Use internal Slack/Teams, an employee badge directory phone number, or the official corporate website contact page."
  );
  verificationInstructions.push(
    "Never use phone numbers, email addresses, or links supplied within the suspicious message itself."
  );

  // Safe Reply Template
  let safeReplyTemplate: string | undefined = undefined;

  if (hasWireOrFinancial || hasAuthorityOrSecrecy) {
    safeReplyTemplate = `Hi ${claimedSender || "there"},

Thank you for your message. In accordance with organizational security protocols and financial verification policies, I cannot process external wire or transaction requests via email without secondary out-of-band authorization.

I will contact you shortly via our official internal corporate directory phone number to verify this request.

Regards,`;
  } else if (hasSuspension || hasCredentials) {
    safeReplyTemplate = undefined; // For account phishing, standard advice is NEVER reply to prevent confirming active inbox!
  } else if (score >= 25) {
    safeReplyTemplate = `Thank you for reaching out. To protect account security, I do not open links or share verification information via direct message. Please resubmit this request through the official platform ticketing portal.`;
  }

  return {
    immediateChecklist,
    safeReplyTemplate,
    verificationInstructions,
  };
}
