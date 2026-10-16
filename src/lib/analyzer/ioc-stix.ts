import {
  IOCEntry,
  ExtractedUrlFinding,
  EmailForensicsReport,
  MITREAttackMapping,
} from "@/types/analyzer";
import { defangUrl, defangDomain } from "./url-intelligence";

export function defangEmail(email: string): string {
  return email.replace(/@/g, "[@]").replace(/\./g, "[.]");
}

export function defangIp(ip: string): string {
  return ip.replace(/\./g, "[.]");
}

export function extractIOCs(
  urls: ExtractedUrlFinding[],
  emailForensics?: EmailForensicsReport,
  senderAddress?: string
): IOCEntry[] {
  const iocs: IOCEntry[] = [];
  const seenValues = new Set<string>();

  // 1. Process Extracted URLs & Domains
  for (const u of urls) {
    if (!seenValues.has(u.rawUrl)) {
      seenValues.add(u.rawUrl);
      iocs.push({
        id: `ioc_url_${iocs.length + 1}`,
        type: "url",
        raw: u.rawUrl,
        defanged: defangUrl(u.rawUrl),
        severity: u.riskScore >= 50 ? "HIGH" : u.riskScore >= 25 ? "MEDIUM" : "LOW",
        category: "Network Lure",
        riskScore: u.riskScore,
      });
    }

    if (!seenValues.has(u.domain) && u.domain !== "Unparseable") {
      seenValues.add(u.domain);
      iocs.push({
        id: `ioc_domain_${iocs.length + 1}`,
        type: u.isIpAddress ? "ip" : "domain",
        raw: u.domain,
        defanged: u.isIpAddress ? defangIp(u.domain) : defangDomain(u.domain),
        severity: u.riskScore >= 50 ? "HIGH" : u.riskScore >= 25 ? "MEDIUM" : "LOW",
        category: u.isIpAddress ? "Host IP" : "DNS Domain",
        riskScore: u.riskScore,
      });
    }
  }

  // 2. Process Sender Email
  if (senderAddress && senderAddress.includes("@") && !seenValues.has(senderAddress)) {
    seenValues.add(senderAddress);
    iocs.push({
      id: `ioc_email_${iocs.length + 1}`,
      type: "email",
      raw: senderAddress,
      defanged: defangEmail(senderAddress),
      severity: "MEDIUM",
      category: "Claimed Sender",
      riskScore: 35,
    });
  }

  // 3. Process Email Forensics (From, Reply-To, Attachments)
  if (emailForensics && emailForensics.isAvailable) {
    if (emailForensics.headers.from && !seenValues.has(emailForensics.headers.from)) {
      seenValues.add(emailForensics.headers.from);
      iocs.push({
        id: `ioc_from_${iocs.length + 1}`,
        type: "email",
        raw: emailForensics.headers.from,
        defanged: defangEmail(emailForensics.headers.from),
        severity: emailForensics.displayNameSpoofingDetected ? "HIGH" : "LOW",
        category: "Envelope From",
        riskScore: emailForensics.displayNameSpoofingDetected ? 60 : 15,
      });
    }

    if (emailForensics.headers.replyTo && !seenValues.has(emailForensics.headers.replyTo)) {
      seenValues.add(emailForensics.headers.replyTo);
      iocs.push({
        id: `ioc_replyto_${iocs.length + 1}`,
        type: "email",
        raw: emailForensics.headers.replyTo,
        defanged: defangEmail(emailForensics.headers.replyTo),
        severity: emailForensics.fromReplyToMismatch ? "HIGH" : "LOW",
        category: "Envelope Reply-To",
        riskScore: emailForensics.fromReplyToMismatch ? 60 : 15,
      });
    }

    for (const attach of emailForensics.attachments) {
      if (!seenValues.has(attach.sha256)) {
        seenValues.add(attach.sha256);
        iocs.push({
          id: `ioc_hash_${iocs.length + 1}`,
          type: "hash",
          raw: attach.sha256,
          defanged: attach.sha256,
          severity: attach.isSuspiciousExtension ? "CRITICAL" : "LOW",
          category: `Attachment Hash (SHA-256: ${attach.filename})`,
          riskScore: attach.isSuspiciousExtension ? 90 : 20,
        });
      }
    }
  }

  return iocs;
}

export function generateSTIX21Bundle(
  reportId: string,
  timestamp: string,
  iocs: IOCEntry[],
  mitreMappings: MITREAttackMapping[]
): Record<string, unknown> {
  const bundleId = `bundle--${reportId.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const objects: Record<string, unknown>[] = [];

  // Report metadata object
  const reportStixId = `report--${reportId.replace(/[^a-zA-Z0-9-]/g, "")}`;

  // 1. Generate Indicator Objects for IOCs
  const indicatorIds: string[] = [];
  iocs.forEach((ioc, idx) => {
    const indicatorId = `indicator--${reportId}-${idx + 1}`;
    indicatorIds.push(indicatorId);

    let pattern = "";
    if (ioc.type === "url") {
      pattern = `[url:value = '${ioc.raw.replace(/'/g, "\\'")}']`;
    } else if (ioc.type === "domain") {
      pattern = `[domain-name:value = '${ioc.raw.replace(/'/g, "\\'")}']`;
    } else if (ioc.type === "ip") {
      pattern = `[ipv4-addr:value = '${ioc.raw}']`;
    } else if (ioc.type === "email") {
      pattern = `[email-addr:value = '${ioc.raw.replace(/'/g, "\\'")}']`;
    } else if (ioc.type === "hash") {
      pattern = `[file:hashes.'SHA-256' = '${ioc.raw}']`;
    }

    objects.push({
      type: "indicator",
      spec_version: "2.1",
      id: indicatorId,
      created: timestamp,
      modified: timestamp,
      name: `${ioc.category}: ${ioc.defanged}`,
      description: `Indicator identified by The Manipulation Decoder heuristic analysis.`,
      indicator_types: ["malicious-activity", "phishing"],
      pattern,
      pattern_type: "stix",
      valid_from: timestamp,
    });
  });

  // 2. Generate Attack Pattern Objects from MITRE Mappings
  mitreMappings.forEach((mitre, idx) => {
    const attackPatternId = `attack-pattern--${mitre.techniqueId.replace(".", "-")}`;
    objects.push({
      type: "attack-pattern",
      spec_version: "2.1",
      id: attackPatternId,
      created: timestamp,
      modified: timestamp,
      name: mitre.techniqueName,
      description: mitre.observedEvidence,
      external_references: [
        {
          source_name: "mitre-attack",
          external_id: mitre.techniqueId,
          url: mitre.referenceUrl,
        },
      ],
    });
  });

  // 3. Stix Report Container
  objects.push({
    type: "report",
    spec_version: "2.1",
    id: reportStixId,
    created: timestamp,
    modified: timestamp,
    name: "The Manipulation Decoder Incident Report",
    description: "Automated psychological manipulation, phishing, and URL analysis bundle.",
    published: timestamp,
    report_types: ["threat-report", "indicator"],
    object_refs: [...indicatorIds],
  });

  return {
    type: "bundle",
    id: bundleId,
    spec_version: "2.1",
    objects,
  };
}
