import { ExtractedUrlFinding } from "@/types/analyzer";

const URL_SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
  "buff.ly", "adf.ly", "bit.do", "mcaf.ee", "rebrand.ly",
  "cutt.ly", "tiny.cc", "qr.net", "v.gd", "soo.gd", "s.id"
]);

const HIGH_ABUSE_TLDS = new Set([
  "xyz", "top", "club", "work", "click", "loan", "buzz", "gq",
  "ml", "cf", "tk", "ga", "cam", "rest", "sbs", "country", "stream"
]);

const KNOWN_BRANDS = [
  { brand: "paypal", domains: ["paypal.com", "paypal.me"] },
  { brand: "apple", domains: ["apple.com", "icloud.com"] },
  { brand: "google", domains: ["google.com", "accounts.google.com"] },
  { brand: "microsoft", domains: ["microsoft.com", "office.com", "live.com", "login.microsoftonline.com"] },
  { brand: "netflix", domains: ["netflix.com"] },
  { brand: "amazon", domains: ["amazon.com", "aws.amazon.com"] },
  { brand: "chase", domains: ["chase.com"] },
  { brand: "bankofamerica", domains: ["bankofamerica.com"] },
  { brand: "wellsfargo", domains: ["wellsfargo.com"] },
  { brand: "facebook", domains: ["facebook.com", "meta.com"] },
  { brand: "instagram", domains: ["instagram.com"] },
  { brand: "whatsapp", domains: ["whatsapp.com"] },
  { brand: "dhl", domains: ["dhl.com"] },
  { brand: "fedex", domains: ["fedex.com"] },
  { brand: "usps", domains: ["usps.com"] },
  { brand: "coinbase", domains: ["coinbase.com"] },
  { brand: "binance", domains: ["binance.com"] },
];

export function defangUrl(url: string): string {
  return url
    .replace(/^https:\/\//i, "hxxps://")
    .replace(/^http:\/\//i, "hxxp://")
    .replace(/\./g, "[.]");
}

export function defangDomain(domain: string): string {
  return domain.replace(/\./g, "[.]");
}

export function isPrivateOrInternalHost(hostname: string): boolean {
  const clean = hostname.toLowerCase().trim();
  if (clean === "localhost" || clean.endsWith(".localhost") || clean === "::1") {
    return true;
  }

  // IPv4 check
  const ipMatch = clean.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const [, o1, o2] = ipMatch.map(Number);
    // 127.0.0.0/8 (Loopback)
    if (o1 === 127) return true;
    // 10.0.0.0/8 (Private)
    if (o1 === 10) return true;
    // 172.16.0.0/12 (Private 172.16 - 172.31)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (o1 === 192 && o2 === 168) return true;
    // 169.254.0.0/16 (Link-local & Cloud Metadata)
    if (o1 === 169 && o2 === 254) return true;
    // 0.0.0.0
    if (o1 === 0) return true;
  }

  return false;
}

export function inspectUrlDetailed(rawUrl: string, claimedOrg?: string): ExtractedUrlFinding {
  const flags: string[] = [];
  const suspiciousComponents: string[] = [];
  let riskScore = 0;

  // Clean trailing punctuation
  const cleanUrl = rawUrl.replace(/[.,;:!?)]+$/, "");
  let urlToParse = cleanUrl;
  if (!/^https?:\/\//i.test(urlToParse)) {
    urlToParse = `https://${urlToParse}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlToParse);
  } catch {
    return {
      rawUrl: cleanUrl,
      domain: "Unparseable",
      protocol: "unknown",
      isHttps: false,
      isIpAddress: false,
      isShortener: false,
      isLookalikeOrPunycode: false,
      isPrivateOrLoopback: false,
      subdomainCount: 0,
      suspiciousComponents: ["Syntax error in URL"],
      reputationStatus: "NOT_CHECKED_OFFLINE",
      reputationProvider: "Offline Local Heuristics",
      riskScore: 40,
      flags: ["Malformed URL syntax"],
      defangedUrl: defangUrl(cleanUrl),
    };
  }

  const protocol = parsedUrl.protocol.replace(":", "").toLowerCase();
  const hostname = parsedUrl.hostname.toLowerCase();
  const isHttps = protocol === "https";

  // 1. SSRF & Internal IP Check
  const isPrivateOrLoopback = isPrivateOrInternalHost(hostname);
  if (isPrivateOrLoopback) {
    riskScore += 60;
    flags.push("SSRF Risk: Destination points to loopback, link-local, or private RFC 1918 address");
    suspiciousComponents.push(`Internal IP/Host: ${hostname}`);
  }

  // 2. Encryption (Plain HTTP)
  if (!isHttps) {
    riskScore += 25;
    flags.push("Unencrypted plain HTTP transmission");
    suspiciousComponents.push("Plain HTTP protocol leaves credentials exposed in cleartext");
  }

  // 3. Raw IP as hostname
  const isIpAddress = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isIpAddress) {
    riskScore += 45;
    flags.push("Destination is a raw numerical IP address used instead of registered domain name");
    suspiciousComponents.push(`Raw IP Destination: ${hostname}`);
  }

  // 4. Punycode check (IDN homograph attack)
  const isPunycode = hostname.startsWith("xn--") || hostname.includes(".xn--");
  if (isPunycode) {
    riskScore += 50;
    flags.push("Punycode (IDN) detected: High risk of internationalized homograph brand impersonation");
    suspiciousComponents.push(`Punycode domain: ${hostname}`);
  }

  // 5. Shortener service
  const isShortener = URL_SHORTENERS.has(hostname);
  if (isShortener) {
    riskScore += 25;
    flags.push("URL Shortener conceals final redirect destination");
    suspiciousComponents.push(`Shortener gateway: ${hostname}`);
  }

  // 6. Userinfo / Misleading '@' in URL
  if (parsedUrl.username || parsedUrl.password || cleanUrl.includes("@")) {
    riskScore += 55;
    flags.push("Deceptive '@' userinfo separator: Browsers ignore text before '@' and connect to following domain");
    suspiciousComponents.push("Misleading authentication credentials embedded in URI");
  }

  // 7. Non-standard ports
  let nonStandardPort: number | undefined = undefined;
  if (parsedUrl.port) {
    const portNum = parseInt(parsedUrl.port, 10);
    if ((isHttps && portNum !== 443) || (!isHttps && portNum !== 80)) {
      nonStandardPort = portNum;
      riskScore += 20;
      flags.push(`Non-standard service port: :${portNum}`);
    }
  }

  // 8. Deceptive Subdomain Nesting
  const hostParts = hostname.split(".");
  const subdomainCount = Math.max(0, hostParts.length - 2);
  if (subdomainCount >= 3) {
    riskScore += 25;
    flags.push(`Excessive subdomains (${subdomainCount}) used to deceive users regarding root domain authority`);
    suspiciousComponents.push(`Multi-level subdomain nesting: ${hostname}`);
  }

  // 9. Typosquatting / Brand Lookalikes
  let isLookalike = false;
  for (const { brand, domains } of KNOWN_BRANDS) {
    const isOfficial = domains.some((d) => hostname === d || hostname.endsWith(`.${d}`));

    if (!isOfficial) {
      if (hostname.includes(brand)) {
        isLookalike = true;
        riskScore += 45;
        flags.push(`Brand name '${brand}' embedded in unauthorized domain '${hostname}'`);
        suspiciousComponents.push(`Unauthorized brand mention: ${hostname}`);
        break;
      }

      // Leetspeak homoglyphs
      const leetMap: [RegExp, string][] = [
        [/0/g, "o"],
        [/1/g, "l"],
        [/vv/g, "w"],
        [/rn/g, "m"],
      ];
      let normalized = hostname;
      for (const [regex, sub] of leetMap) {
        normalized = normalized.replace(regex, sub);
      }
      if (normalized.includes(brand) && !hostname.includes(brand)) {
        isLookalike = true;
        riskScore += 55;
        flags.push(`Typosquatting/Homoglyph substitution impersonating '${brand}' detected in '${hostname}'`);
        suspiciousComponents.push(`Obfuscated brand lookalike: ${hostname}`);
        break;
      }
    }
  }

  // 10. High abuse TLD
  const tld = hostParts[hostParts.length - 1];
  if (HIGH_ABUSE_TLDS.has(tld)) {
    riskScore += 15;
    flags.push(`Domain registered under high-abuse registrar TLD (.${tld})`);
  }

  // 11. Claimed organization mismatch
  if (claimedOrg && claimedOrg.trim().length > 2) {
    const orgLower = claimedOrg.toLowerCase().trim();
    const matchesClaimed = KNOWN_BRANDS.some(
      (b) => orgLower.includes(b.brand) && b.domains.some((d) => hostname === d || hostname.endsWith(`.${d}`))
    );
    if (!matchesClaimed && !hostname.includes(orgLower.replace(/\s+/g, ""))) {
      flags.push(`Destination domain '${hostname}' does not match claimed organization '${claimedOrg}'`);
      riskScore += 20;
    }
  }

  const finalRisk = Math.min(100, riskScore);

  return {
    rawUrl: cleanUrl,
    domain: hostname,
    protocol,
    isHttps,
    isIpAddress,
    isShortener,
    isLookalikeOrPunycode: isPunycode || isLookalike,
    isPrivateOrLoopback,
    nonStandardPort,
    subdomainCount,
    suspiciousComponents,
    reputationStatus: "NOT_CHECKED_OFFLINE",
    reputationProvider: "Local Heuristics Engine (Offline Safe Inspection)",
    riskScore: finalRisk,
    flags,
    defangedUrl: defangUrl(cleanUrl),
  };
}
