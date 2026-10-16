import {
  ManipulationFinding,
  ManipulationCategory,
  FindingSeverity,
} from "@/types/analyzer";
import { getWhyThisMightWorkExplanation } from "./mitre-attack";

interface TacticDefinition {
  category: ManipulationCategory;
  tacticName: string;
  severity: FindingSeverity;
  patterns: RegExp[];
  techniqueExplanation: string;
  riskReason: string;
  recommendedAction: string;
}

const MANIPULATION_TACTICS: TacticDefinition[] = [
  {
    category: "CREDENTIAL_OTP_HARVESTING",
    tacticName: "Credential & Authentication Secret Harvesting",
    severity: "CRITICAL",
    patterns: [
      /(?:send|share|enter|provide|confirm|verify|reply with|input)\s+(?:your\s+)?(?:6-digit|one-time|otp|passcode|password|pin|security code|mfa code|2fa code|verification code)/i,
      /(?:do not share this code|share this code with our agent|read back the code|code sent to your phone)/i,
      /(?:enter your credentials|log in to retain access|submit your password)/i,
      /(?:secret phrase|seed phrase|private key)/i,
    ],
    techniqueExplanation:
      "Exploits perceived legitimate authentication routines to trick the target into surrendering temporary or permanent access keys.",
    riskReason:
      "Once an attacker captures an OTP or password, they can bypass multi-factor authentication (MFA) and seize direct control of your accounts or funds.",
    recommendedAction:
      "NEVER disclose an OTP, password, or security token. Legitimate customer support staff and automated security bots will never ask you to reveal an authentication passcode.",
  },
  {
    category: "ACCOUNT_SUSPENSION_THREAT",
    tacticName: "Imminent Account Termination Threat",
    severity: "HIGH",
    patterns: [
      /(?:account|access|subscription|service|profile)\s+(?:will be|has been|is scheduled to be)\s+(?:suspended|terminated|deactivated|locked|closed|blocked|disabled|frozen)/i,
      /(?:permanent(?:ly)?\s+(?:loss|deletion|closure|termination|restricted))/i,
      /(?:immediate action required to keep your account)/i,
      /(?:failure to verify will result in immediate (?:suspension|cancellation))/i,
    ],
    techniqueExplanation:
      "Triggers loss aversion and existential anxiety by threatening to revoke access to vital services (banking, email, work platform, cloud access).",
    riskReason:
      "Targets act impulsively to avoid perceived disruption without stopping to verify whether the notification came from an authentic source.",
    recommendedAction:
      "Do NOT click any button or link in the message. Open your web browser independently, navigate to the service's official website, and verify your account status directly.",
  },
  {
    category: "URGENCY",
    tacticName: "Artificial Time Pressure & Urgency",
    severity: "HIGH",
    patterns: [
      /(?:within\s+(?:24|12|48|2|1)\s*(?:hours|hrs|minutes|mins))/i,
      /(?:immediate(?:ly)?\s+action\s+required|act immediately|urgent notice|time-sensitive)/i,
      /(?:expires\s+(?:today|tonight|in\s+\d+\s*(?:minutes|hours)))/i,
      /(?:before\s+it(?:'s|\s+is)\s+too\s+late|final\s+courtesy\s+notice)/i,
      /(?:respond\s+promptly|right\s+now|at\s+once)/i,
    ],
    techniqueExplanation:
      "Constrains the victim's cognitive deliberation window, forcing reliance on fast, emotional System-1 thinking rather than careful scrutiny.",
    riskReason:
      "Scammers introduce artificial deadlines because scrutiny and consultation with colleagues usually expose the fraud.",
    recommendedAction:
      "Deliberately slow down. Legitimate urgent security crises are communicated via verified direct channels, not unverified single-shot messages demanding instant compliance.",
  },
  {
    category: "FEAR_AND_THREATS",
    tacticName: "Fear, Legal Retribution & Intimidation",
    severity: "HIGH",
    patterns: [
      /(?:legal\s+action|lawsuit|law\s+enforcement|police|arrest\s+warrant|court\s+summons)/i,
      /(?:fined|prosecuted|penalties|criminal\s+charges)/i,
      /(?:compromised\s+system|hacked|ransom|compromised\s+webcam|recorded\s+video)/i,
      /(?:you\s+will\s+be\s+held\s+liable|serious\s+consequences)/i,
    ],
    techniqueExplanation:
      "Activates panic and self-preservation instincts through intimidating references to law enforcement, legal penalties, or exposure of private data.",
    riskReason:
      "Fear clouds rational judgment and prompts immediate surrender to extortion or malicious compliance demands.",
    recommendedAction:
      "Do not panic or reply. Real judicial, governmental, or police agencies deliver official physical paperwork or recognized summons, not informal threatening digital messages.",
  },
  {
    category: "AUTHORITY_IMPERSONATION",
    tacticName: "Authority & Executive Impersonation",
    severity: "HIGH",
    patterns: [
      /(?:from\s+the\s+(?:desk\s+of\s+the\s+)?(?:ceo|cfo|executive|director|president|it\s+security\s+team|hr\s+department))/i,
      /(?:this\s+is\s+([a-z\s]+,?\s+)?(?:the\s+)?(?:ceo|cfo|executive|director|president)|chief\s+executive\s+officer)/i,
      /(?:internal\s+revenue\s+service|irs|federal\s+reserve|fbi|interpol|hmrc|tax\s+authority)/i,
      /(?:official\s+support\s+desk|corporate\s+security\s+compliance|system\s+administrator)/i,
      /(?:on\s+behalf\s+of\s+senior\s+management)/i,
    ],
    techniqueExplanation:
      "Exploits deeply conditioned societal and workplace deference to authority figures, corporate executives, or regulatory institutions.",
    riskReason:
      "Employees or individuals hesitate to challenge perceived superiors, bypassing skepticism out of fear of insubordination.",
    recommendedAction:
      "Verify the claimed sender through an established secondary channel (e.g. internal Slack/Teams, calling the verified corporate switchboard, or contacting IT directly).",
  },
  {
    category: "FINANCIAL_PRESSURE",
    tacticName: "Financial Coercion & Irregular Payment Demands",
    severity: "HIGH",
    patterns: [
      /(?:wire\s+(?:transfer|\$\d+|funds|money|the\s+amount|immediately)|remit\s+funds|swift|western\s+union|moneygram)/i,
      /(?:gift\s+cards?|itunes\s+card|apple\s+gift\s+card|steam\s+card|google\s+play\s+card)/i,
      /(?:bitcoin|btc|cryptocurrency|crypto\s+wallet|ethereum|usdt)/i,
      /(?:unpaid\s+invoice|overdue\s+balance|outstanding\s+payment|billing\s+discrepancy)/i,
      /(?:direct\s+deposit|change\s+banking\s+details|payroll\s+account|expedite\s+(?:this\s+)?payment)/i,
    ],
    techniqueExplanation:
      "Creates financial stress through alleged debts or requests unconventional, untraceable payment instruments that offer zero buyer protection.",
    riskReason:
      "Funds transferred via gift cards, cryptocurrency, or rogue wire accounts cannot be reversed once processed.",
    recommendedAction:
      "Stop immediately. Never pay debts or purchase corporate supplies via gift cards, crypto, or redirected wire accounts. Validate with accounting through approved protocols.",
  },
  {
    category: "SECRECY_ISOLATION",
    tacticName: "Enforced Secrecy & Target Isolation",
    severity: "HIGH",
    patterns: [
      /(?:keep\s+this\s+(?:strictly\s+)?confidential|do\s+not\s+(?:discuss|mention|disclose)\s+this)/i,
      /(?:do\s+not\s+call\s+me|i(?:'m|\s+am)\s+in\s+a\s+meeting|cannot\s+take\s+calls)/i,
      /(?:between\s+you\s+and\s+me|secret\s+project|confidential\s+acquisition)/i,
      /(?:handle\s+this\s+discreetly|bypass\s+the\s+front\s+desk)/i,
    ],
    techniqueExplanation:
      "Isolates the target from their support network, colleagues, or advisors, preventing second opinions that would quickly expose the scam.",
    riskReason:
      "Isolation is a hallmark of high-value spear-phishing (Business Email Compromise). Without peer confirmation, victims walk into traps alone.",
    recommendedAction:
      "Immediately break the secrecy. Consult a colleague, supervisor, or trusted friend before taking any requested action.",
  },
  {
    category: "BYPASS_PROCEDURES",
    tacticName: "Procedure & Security Control Bypass",
    severity: "HIGH",
    patterns: [
      /(?:skip\s+the\s+usual\s+process|bypass\s+(?:the\s+)?(?:standard|normal)\s+(?:procedure|approval))/i,
      /(?:we\s+can\s+file\s+the\s+paperwork\s+later|override\s+the\s+system)/i,
      /(?:disable\s+your\s+(?:antivirus|firewall|vpn|security\s+settings))/i,
      /(?:grant\s+temporary\s+exception|expedite\s+without\s+po)/i,
    ],
    techniqueExplanation:
      "Encourages the victim to treat formal policies and security safeguards as unnecessary bureaucratic roadblocks that should be set aside.",
    riskReason:
      "Bypassing internal controls (dual-signoff, verification calls) directly enables fraudulent payments and malware installation.",
    recommendedAction:
      "Refuse to bypass standard controls. Legitimate organizational emergencies still adhere to emergency authorization frameworks.",
  },
  {
    category: "CURIOSITY_AND_BAIT",
    tacticName: "Curiosity Baiting & Voyeuristic Appeal",
    severity: "MEDIUM",
    patterns: [
      /(?:look\s+at\s+what\s+(?:they|someone)\s+posted\s+about\s+you)/i,
      /(?:is\s+this\s+you\s+in\s+this\s+(?:video|picture|photo))/i,
      /(?:confidential\s+bonus\s+list|salary\s+breakdown|leaked\s+document)/i,
      /(?:shocking\s+revelation|you\s+won(?:'t|\s+not)\s+believe\s+this)/i,
    ],
    techniqueExplanation:
      "Hooks the human instinct for social gossip, personal reputation defense, or voyeurism to trigger an unthinking click.",
    riskReason:
      "These links frequently lead directly to credential harvesting phishing portals or drive-by payload downloads.",
    recommendedAction:
      "Do not click. Ask yourself: Why would someone send a sensitive claim or photo via an unverified link or odd context?",
  },
  {
    category: "SCARCITY",
    tacticName: "Artificial Scarcity & FOMO",
    severity: "MEDIUM",
    patterns: [
      /(?:only\s+\d+\s+(?:spots?|items?|claims?|vouchers?)\s+(?:remaining|left))/i,
      /(?:exclusive\s+opportunity|limited\s+time\s+offer|once\s+in\s+a\s+lifetime)/i,
      /(?:first\s+\d+\s+responders?\s+(?:win|receive|get))/i,
    ],
    techniqueExplanation:
      "Leverages Fear Of Missing Out (FOMO) to induce rapid compliance before perceived scarce rewards disappear.",
    riskReason:
      "Scarcity tactics lower skepticism and distract victims from examining sender authenticity.",
    recommendedAction:
      "Recognize that legitimate professional or commercial benefits rarely vanish within minutes without prior notice.",
  },
  {
    category: "SOCIAL_PROOF",
    tacticName: "Social Proof & Manufactured Conformity",
    severity: "MEDIUM",
    patterns: [
      /(?:all\s+other\s+(?:employees|team\s+members|colleagues|users)\s+have\s+already)/i,
      /(?:you\s+are\s+the\s+only\s+one\s+who\s+has\s+not\s+(?:completed|signed|submitted))/i,
      /(?:everyone\s+else\s+has\s+agreed)/i,
      /(?:thousands\s+of\s+users\s+already\s+verified)/i,
    ],
    techniqueExplanation:
      "Preys on desire to fit into the group and avoid standing out as delinquent or uncooperative.",
    riskReason:
      "Victims comply because they assume others have already validated the legitimacy of the request.",
    recommendedAction:
      "Verify with one of the alleged other participants directly rather than accepting the sender's assertion.",
  },
  {
    category: "GUILT_COERCION",
    tacticName: "Guilt & Emotional Coercion",
    severity: "MEDIUM",
    patterns: [
      /(?:don(?:'t|\s+not)\s+let\s+the\s+team\s+down|everyone\s+is\s+waiting\s+on\s+you)/i,
      /(?:if\s+you\s+cared\s+about\s+(?:our\s+work|this\s+company|the\s+project))/i,
      /(?:i\s+thought\s+i\s+could\s+count\s+on\s+you)/i,
      /(?:you\s+are\s+putting\s+(?:us|everyone)\s+at\s+risk)/i,
    ],
    techniqueExplanation:
      "Induces interpersonal guilt to pressure the victim into performing risky tasks to preserve approval.",
    riskReason:
      "Emotional manipulation weakens normal risk boundaries and discourages questioning the request.",
    recommendedAction:
      "Separate personal relationships and feelings from administrative or security protocols. Adhering to protocol is never a betrayal.",
  },
  {
    category: "TRUST_EXPLOITATION",
    tacticName: "Trust Exploitation & Fabricated Familiarity",
    severity: "LOW",
    patterns: [
      /(?:as\s+your\s+(?:friend|colleague|partner|trusted\s+advisor))/i,
      /(?:you\s+know\s+me|we\s+worked\s+together|trust\s+me\s+on\s+this)/i,
      /(?:doing\s+you\s+a\s+personal\s+favor)/i,
    ],
    techniqueExplanation:
      "Artificially claims intimacy or shared history to bypass defenses reserved for strangers.",
    riskReason:
      "Attackers impersonate existing contacts or spoof names to hijack pre-existing goodwill.",
    recommendedAction:
      "Always inspect the actual email address, phone number, or handle behind a familiar display name.",
  },
];

/**
 * Extracts the exact sentence or clause containing the pattern match from the text.
 */
function extractQuotedEvidence(text: string, regex: RegExp): string {
  const match = text.match(regex);
  if (!match || match.index === undefined) return "";

  const matchStart = match.index;
  const matchEnd = matchStart + match[0].length;

  // Find sentence or clause boundaries surrounding the match
  const textBefore = text.slice(0, matchStart);
  const textAfter = text.slice(matchEnd);

  // Look backwards for start of sentence or punctuation
  const prevPunctuation = Math.max(
    textBefore.lastIndexOf("."),
    textBefore.lastIndexOf("!"),
    textBefore.lastIndexOf("?"),
    textBefore.lastIndexOf("\n")
  );
  const startIdx = prevPunctuation >= 0 ? prevPunctuation + 1 : 0;

  // Look forwards for end of sentence or punctuation
  const nextPunctuationMatches = textAfter.search(/[.!?\n]/);
  const endIdx =
    nextPunctuationMatches >= 0
      ? matchEnd + nextPunctuationMatches
      : text.length;

  const quote = text.slice(startIdx, endIdx).trim();
  // Return either the clause or the exact matched phrase if quote is too long
  return quote.length > 180 ? match[0] : quote;
}

export function detectManipulationTactics(text: string): ManipulationFinding[] {
  const findings: ManipulationFinding[] = [];
  const detectedCategories = new Set<ManipulationCategory>();

  for (const tactic of MANIPULATION_TACTICS) {
    for (const pattern of tactic.patterns) {
      if (pattern.test(text)) {
        if (!detectedCategories.has(tactic.category)) {
          detectedCategories.add(tactic.category);
          const quotedText = extractQuotedEvidence(text, pattern);

          findings.push({
            id: `manip_${tactic.category.toLowerCase()}_${findings.length + 1}`,
            category: tactic.category,
            tacticName: tactic.tacticName,
            severity: tactic.severity,
            quotedText: quotedText || "Pattern matched in submitted text",
            techniqueExplanation: tactic.techniqueExplanation,
            whyThisMightWork: getWhyThisMightWorkExplanation(tactic.category),
            riskReason: tactic.riskReason,
            recommendedAction: tactic.recommendedAction,
            detectionSource: "RULE_ENGINE",
            isDirectlyObserved: true,
          });
        }
        break; // One finding per tactic category is sufficient
      }
    }
  }

  // Sort findings by severity: CRITICAL > HIGH > MEDIUM > LOW > INFO
  const severityOrder: Record<FindingSeverity, number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    INFO: 1,
  };

  findings.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

  return findings;
}
