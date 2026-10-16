export interface DemoScenario {
  id: string;
  title: string;
  badge: string;
  badgeColor: "red" | "amber" | "green" | "cyan";
  description: string;
  message: string;
  senderName?: string;
  senderAddress?: string;
  contextType: "email" | "sms" | "chat" | "payment" | "other";
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "demo-suspension-otp",
    title: "1. Account Suspension & OTP Phishing",
    badge: "Critical Phishing",
    badgeColor: "red",
    description: "Urgent bank impersonation threatening suspension and demanding immediate OTP verification.",
    senderName: "Bank of America Security Alert",
    senderAddress: "security-alert@bankofamerica-alerts.support-notice.com",
    contextType: "sms",
    message: `URGENT SECURITY ALERT: Unauthorized activity has been detected on your Bank of America checking account. Your access will be suspended within 24 hours to prevent total loss of funds.

Please verify your identity immediately to retain access. Click the link below and enter your 6-digit verification code:
http://bankofamerica.com.account-verify.xyz/login

Do not ignore this notice. Failure to verify will result in permanent account termination.`,
  },
  {
    id: "demo-ceo-wire-fraud",
    title: "2. CEO Impersonation & Wire Fraud",
    badge: "Social Engineering",
    badgeColor: "red",
    description: "Executive impersonation leveraging extreme urgency, authority, and enforced secrecy (BEC).",
    senderName: "Arthur Vance, Chief Executive Officer",
    senderAddress: "ceo-office.private@executive-mail.org",
    contextType: "email",
    message: `Team,

This is an urgent notice from the desk of the CEO. I am currently tied up in an off-site confidential acquisition meeting and cannot take phone calls.

We require an immediate wire transfer of $78,500 to finalize escrow for Project Horizon. Skip the standard purchase order workflow and expedite this payment right now without delay. 

Keep this matter strictly confidential. Do not discuss this with anyone in accounting or management until the transaction is confirmed. I am counting on your promptness.

Arthur Vance
Chief Executive Officer`,
  },
  {
    id: "demo-benign-message",
    title: "3. Harmless Everyday Message",
    badge: "Harmless / Clean",
    badgeColor: "green",
    description: "Authentic, normal everyday communication without manipulation, links, or threats.",
    senderName: "Marcus Brody",
    senderAddress: "mbrody@acmeworks.com",
    contextType: "chat",
    message: `Hey everyone, quick update on the project roadmap: we just wrapped up the sprint retrospective and pushed the release notes to our internal documentation portal. 

Are we still on for our team lunch this Friday at noon? Let me know if that time still works for everyone, or if we should push it back by 30 minutes. Have a great afternoon!`,
  },
  {
    id: "demo-ai-benign-memo",
    title: "4. Polished AI-Generated Corporate Memo",
    badge: "AI-Style (Benign)",
    badgeColor: "cyan",
    description: "Highly structured, polished AI-like prose with uniform cadence, but zero malicious intent.",
    senderName: "Operations Strategy Desk",
    senderAddress: "ops-strategy@company.org",
    contextType: "email",
    message: `Dear Valued Colleagues,

I hope this message finds you well. In today's fast-paced environment, streamlining our operational workflows serves as a vital component of sustainable organizational agility. Furthermore, it is crucial to note that fostering a culture of cross-functional synergy significantly empowers our collaborative milestones. 

Moreover, embracing these structured protocols will systematically bolster our strategic capabilities as we navigate future complexities. In conclusion, each department's dedication underscores our collective pursuit of excellence.

Please do not hesitate to reach out if you have any questions or concerns regarding our new initiatives. Thank you for your continued dedication.

Warm regards,
Operations Management`,
  },
];
