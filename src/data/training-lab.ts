export interface TrainingScenario {
  id: string;
  title: string;
  category: "University Phishing" | "Executive Fraud" | "Delivery Scam" | "Tech Support Scam" | "Harmless Internal" | "AI-Assisted Benign";
  senderDisplay: string;
  senderAddress: string;
  contextType: "email" | "sms" | "chat";
  messageText: string;
  correctVerdict: "DANGEROUS_PHISHING" | "SAFE_BENIGN";
  deceptiveSignalExplanation: string;
  keyTakeaway: string;
}

export const TRAINING_SCENARIOS: TrainingScenario[] = [
  {
    id: "lab_scenario_1",
    title: "1. Campus Portal Account Suspension Notice",
    category: "University Phishing",
    senderDisplay: "Campus IT Identity Services",
    senderAddress: "servicedesk@univ-portal.identity-auth.top",
    contextType: "email",
    messageText: `Attention University Student/Staff:

Your campus portal credentials have failed our annual compliance audit. Your access to coursework, university email, and library accounts will be suspended within 12 hours.

To avoid deactivation, authenticate your account immediately at http://university.edu.verify-session.xyz and provide your 6-digit MFA passcode.

Failure to verify will lead to immediate cancellation of student system enrollment.`,
    correctVerdict: "DANGEROUS_PHISHING",
    deceptiveSignalExplanation:
      "Uses university branding and time pressure ('within 12 hours') to trigger panic. The destination domain 'verify-session.xyz' is a deceptive lookalike, not an authentic '.edu' institutional domain.",
    keyTakeaway:
      "Universities never threaten account termination via arbitrary 12-hour deadlines with '.xyz' links. Always browse directly to the verified university portal.",
  },
  {
    id: "lab_scenario_2",
    title: "2. Confidential Executive Wire Request",
    category: "Executive Fraud",
    senderDisplay: "David Keller, VP of Operations",
    senderAddress: "david.keller.office@board-executive.org",
    contextType: "email",
    messageText: `Good morning,

I am currently in an off-site confidential acquisition meeting with our investment bankers and cannot answer phone calls.

We need to wire transfer $64,200 immediately to complete the closing escrow deposit. Please process this payment right now. Skip the normal purchase order workflow—we can file the paperwork retroactively.

Keep this matter strictly confidential. Do not discuss this with anyone in accounting or your supervisor until the wire is confirmed.`,
    correctVerdict: "DANGEROUS_PHISHING",
    deceptiveSignalExplanation:
      "A classic Business Email Compromise (BEC) scenario. Exploits authority ('VP of Operations'), urgency, and enforces strict secrecy ('do not discuss this with anyone') to isolate the target from peer validation.",
    keyTakeaway:
      "Legitimate executives never authorize financial transfers with instructions to violate financial controls and enforce secrecy. Always confirm via known out-of-band phone directories.",
  },
  {
    id: "lab_scenario_3",
    title: "3. Missed Parcel Delivery & Redelivery Fee",
    category: "Delivery Scam",
    senderDisplay: "Express Parcel Logistics",
    senderAddress: "+1 (800) 412-9831",
    contextType: "sms",
    messageText: `USPS Notice: Your package could not be delivered on Oct 16 due to an incomplete delivery address on file. 

Update your street address and pay the $1.85 redelivery customs fee within 24 hours at http://192.168.1.180/usps-redelivery to reschedule delivery, or the parcel will be returned to sender.`,
    correctVerdict: "DANGEROUS_PHISHING",
    deceptiveSignalExplanation:
      "Presents a trivial $1.85 charge as low-risk bait, but points to a raw IP address ('192.168.1.180') designed to harvest complete credit card numbers and personal identity details.",
    keyTakeaway:
      "Postal services do not text links using raw numerical IP addresses or demand credit cards via unsolicited SMS. Look up your tracking number directly on usps.com.",
  },
  {
    id: "lab_scenario_4",
    title: "4. Urgent Windows Security Firewall Warning",
    category: "Tech Support Scam",
    senderDisplay: "Microsoft Global Helpdesk Alert",
    senderAddress: "security-alert@microsoft-windows-support.click",
    contextType: "email",
    messageText: `CRITICAL ALERT: Multiple Trojan viruses detected on your Windows workstation. Your network IP has been locked to prevent corporate server contamination.

Call our toll-free technical support number immediately at 1-888-555-0199 or install AnyDesk remote access to allow our certified security technicians to disinfect your machine. Do not reboot your computer.`,
    correctVerdict: "DANGEROUS_PHISHING",
    deceptiveSignalExplanation:
      "Manufactures fear through false malware claims and urges installing remote desktop software (AnyDesk) to hand the attacker full keyboard and file access.",
    keyTakeaway:
      "Operating system vendors do not send unsolicited emails telling users to call phone numbers or install remote-control software.",
  },
  {
    id: "lab_scenario_5",
    title: "5. Internal Sprint Retrospective & Architecture Review",
    category: "Harmless Internal",
    senderDisplay: "Elena Rostova",
    senderAddress: "erostova@engineering.internal",
    contextType: "chat",
    messageText: `Hey team! Great job on completing the sprint milestone today. The test coverage reached 92% and the new microservice passed all load tests.

Let's meet tomorrow at 11:00 AM in Conference Room B for the retrospective. Please add any talking points you'd like to cover to our shared team wiki before 10 AM. See you all tomorrow!`,
    correctVerdict: "SAFE_BENIGN",
    deceptiveSignalExplanation:
      "Contains conversational scheduling and positive reinforcement with zero manipulation tactics, zero deceptive links, and no request for credentials or money.",
    keyTakeaway:
      "Routine professional collaboration with verifiable internal colleagues without artificial pressure or secret requests represents safe, normal communication.",
  },
  {
    id: "lab_scenario_6",
    title: "6. Polished AI-Assisted Corporate Memo",
    category: "AI-Assisted Benign",
    senderDisplay: "Strategic Operations Directorate",
    senderAddress: "ops-strategy@company.org",
    contextType: "email",
    messageText: `Dear Valued Colleagues,

I hope this message finds you well. In today's fast-paced environment, streamlining our operational workflows serves as a vital component of sustainable organizational agility. Furthermore, it is crucial to note that fostering cross-functional synergy empowers our collaborative milestones. 

Moreover, embracing these structured protocols will systematically bolster our strategic capabilities as we navigate future complexities. In conclusion, each department's dedication underscores our collective pursuit of excellence.

Please do not hesitate to reach out if you have any questions or concerns regarding these initiatives. Thank you for your continued dedication.

Warm regards,
Operations Management`,
    correctVerdict: "SAFE_BENIGN",
    deceptiveSignalExplanation:
      "Features high AI-writing characteristics (uniform sentence cadence, corporate boilerplate openings and closings, transition markers), but carries ZERO phishing indicators, ZERO links, and NO malicious intent.",
    keyTakeaway:
      "Crucial security principle: AI-style writing does NOT equal malware or phishing. Always evaluate cybersecurity risk independently from literary polish.",
  },
];
