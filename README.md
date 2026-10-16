# The Manipulation Decoder — Advanced Cybersecurity Platform

> **Decode the message. Detect the manipulation. Defend yourself.**

A defensive cybersecurity platform and cognitive threat-analysis application that inspects digital communications (emails, raw `.eml` forensics, SMS, direct messages, payment lures, screenshots via on-device OCR, and isolated URLs). It identifies psychological manipulation tactics, detects phishing and social engineering vectors, performs safe offline URL structure analysis with SSRF filtering, and provides an independent stylometric AI-writing likelihood assessment.

---

## 🛡️ Core Platform Capabilities

### 1. Four Advanced Investigation Modes
- **Mode A: Analyze a Message:** Accepts pasted emails, SMS, Slack/Teams chats, WhatsApp, social media DMs, and financial transfer lures with optional sender metadata.
- **Mode B: Email Forensics:** Ingests raw `.eml` files or pasted RFC 822 / MIME email headers and body. Analyzes:
  - Envelope headers (`From`, `To`, `Reply-To`, `Return-Path`, `Subject`, `Message-ID`).
  - Display Name Spoofing (e.g. `"Bank of America" <support@customer-verification.xyz>`).
  - From vs. Reply-To and From vs. Return-Path domain mismatches.
  - Authentication-Results parsing with honest evaluation of SPF, DKIM, and DMARC.
  - Multi-hop `Received:` routing relay analysis.
  - HTML body anchor discrepancies: flags when displayed link text contradicts the underlying destination `href`.
  - Safe attachment metadata extraction and SHA-256 cryptographic hashing (flags `.exe`, `.scr`, `.vbs`, `.iso`, `.hta`, `.docm`).
- **Mode C: URL & Domain Intelligence:** Isolated URL safety inspection with strict SSRF protection (loopback, link-local, private RFC 1918, and cloud metadata filtering). Destination URLs are **never fetched or navigated to** by the server.
- **Mode D: Screenshot OCR:** On-device client-side OCR using `tesseract.js` in your browser. Extracts text from screenshots of mobile messages or notifications and allows verification/editing before analysis. Images are **never uploaded to external clouds**.

### 2. Dual User Experience (Protection Mode vs. Analyst Mode)
- **Protection Mode (Everyday Users):**
  - High-level warning or reassurance summary in plain English.
  - Specific non-jargon explanations of why the message may be risky.
  - "What should I do now?" immediate operational checklist.
  - **Safe Response Assistant:** Contextual non-committal reply templates that refuse suspicious links and mandate out-of-band directory verification without leaking personal details.
- **Analyst Mode (Cybersecurity Specialists):**
  - **Threat Radar & Breakdown:** Distinct scores for Cyber Threat Index (0–100), Manipulation Index (0–100), Phishing Signal Score (0–100), and AI Stylometric Signal (0–100).
  - **Psychological Manipulation Map:** Quoted evidence, psychological mechanisms, and dedicated *"Why this might work on humans"* cognitive explanations.
  - **Email Forensics Deep-Dive:** Headers, SPF/DKIM/DMARC status, relay hops, anchor mismatches, and attachment SHA-256 hashes.
  - **URL & Domain Intelligence:** Punycode, typosquatting homoglyphs, URL shorteners, and defanged URLs (`hxxps[://]`).
  - **Indicators of Compromise & STIX 2.1:** Defanged IOCs table with one-click copy and export to valid OASIS STIX 2.1 JSON threat bundles.
  - **MITRE ATT&CK Enterprise Matrix:** Direct mapping to techniques (e.g., `T1566.001`, `T1566.002`, `T1598.003`, `T1534`, `T1204.001`, `T1562.001`) with reference documentation links.
  - **AI-Writing Likelihood — Experimental:** Decoupled stylometric evaluation (sentence cadence uniformity, Type-Token Ratio lexical diversity, and transition density).

### 3. Interactive Cybersecurity Training Lab
- Guided interactive training module with 6 realistic threat simulations:
  1. Campus Portal Account Suspension Notice (University Phishing & OTP theft)
  2. Confidential Executive Wire Request (CEO Fraud / BEC)
  3. Missed Parcel Delivery & Redelivery Fee (Smishing with Raw IP lure)
  4. Urgent Windows Security Firewall Warning (Tech Support Remote Access Scam)
  5. Internal Sprint Retrospective (Harmless Everyday Collaboration)
  6. Polished AI-Assisted Corporate Memo (AI-Generated Style, completely Benign)
- Users decide whether the scenario is Dangerous or Safe before revealing the true state, deceptive signals, and defensive takeaways.
- Includes a one-click button to run any scenario through the live analysis pipeline.

### 4. Local Privacy & Safe Case History
- **Zero Server Persistence:** All message content and EML uploads are processed ephemerally in-memory. No database, server telemetry, or raw message console logging.
- **Browser-Only Case History:** Opt-in local storage drawer that saves minimal summary metadata in your browser's LocalStorage. Users can view, delete individual cases, or clear history at any time.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js `v18.18+`, `v20+`, or `v24+` (tested on Node `v24.19.0`)
- npm `v9+` or `v12+`

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Automated Tests
```bash
npm run test
```
Executes the comprehensive Vitest test suite (20 automated tests) verifying input limits, benign messages, OTP requests, CEO fraud, URL parsing, SSRF filtering, email forensics, anchor mismatches, defanged IOCs, STIX 2.1 bundles, and MITRE ATT&CK mappings.

### 4. Start Development or Production Server
**Development:**
```bash
npm run dev
```

**Production Build & Start:**
```bash
npm run build
npm run start -p 3000
```

The application will be accessible at:
👉 **`http://localhost:3000`**

---

## 🔒 Security Architecture & SSRF Protection

- **No Remote Link Fetching:** Extracted URLs are parsed strictly offline. The backend never navigates to, downloads from, or visits submitted URLs.
- **SSRF Blocklist:** Destinations resolving to loopback (`127.0.0.0/8`, `localhost`, `::1`), link-local (`169.254.0.0/16`), private RFC 1918 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), or cloud metadata endpoints (`169.254.169.254`) are flagged with elevated risk.
- **Untrusted Input Treatment:** Submitted messages, email headers, and embedded instructions are treated strictly as untrusted data inputs, never as executable code or prompt instructions.
- **Security Response Headers:** Configured with `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Cache-Control: no-store`.

---

## 🔌 Offline vs. Optional External Adapters

- **Offline Mode (Default):** The entire application functions 100% offline out-of-the-box. All 13 manipulation tactic classifiers, phishing heuristics, stylometric AI writing markers, safe URL parsers, and email forensics execute locally via the built-in deterministic engine.
- **Optional External Adapters (`.env.example`):**
  - `GOOGLE_SAFE_BROWSING_API_KEY`: Can be configured for live Google Safe Browsing / Web Risk queries.
  - `VIRUSTOTAL_API_KEY`: Can be configured for live domain reputation queries.
  - `URLHAUS_API_KEY`: Can be configured for URLhaus malware database queries.
  - When keys are omitted, the application transparently reports local heuristic status in the report limitations panel.
