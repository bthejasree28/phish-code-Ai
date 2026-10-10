import { RiskLevel, ScanResult } from '../types';

// List of high-risk Top-Level Domains frequently utilized in automated phishing campaigns
const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'tk', 'zip', 'mov', 'cam', 'gq', 'cf', 'ml', 'ga',
  'click', 'buzz', 'rest', 'shop', 'work', 'fit', 'surf', 'sbs',
  'cfd', 'icu', 'monster', 'hair', 'bond', 'live', 'online', 'vip'
]);

// High-value targets commonly impersonated in brand phishing
const TARGET_BRANDS: { name: string; legitDomain: string }[] = [
  { name: 'paypal', legitDomain: 'paypal.com' },
  { name: 'google', legitDomain: 'google.com' },
  { name: 'apple', legitDomain: 'apple.com' },
  { name: 'microsoft', legitDomain: 'microsoft.com' },
  { name: 'netflix', legitDomain: 'netflix.com' },
  { name: 'amazon', legitDomain: 'amazon.com' },
  { name: 'bankofamerica', legitDomain: 'bankofamerica.com' },
  { name: 'chase', legitDomain: 'chase.com' },
  { name: 'wellsfargo', legitDomain: 'wellsfargo.com' },
  { name: 'citibank', legitDomain: 'citi.com' },
  { name: 'facebook', legitDomain: 'facebook.com' },
  { name: 'instagram', legitDomain: 'instagram.com' },
  { name: 'whatsapp', legitDomain: 'whatsapp.com' },
  { name: 'usps', legitDomain: 'usps.com' },
  { name: 'fedex', legitDomain: 'fedex.com' },
  { name: 'dhl', legitDomain: 'dhl.com' },
  { name: 'ups', legitDomain: 'ups.com' },
  { name: 'irs', legitDomain: 'irs.gov' },
  { name: 'coinbase', legitDomain: 'coinbase.com' },
  { name: 'binance', legitDomain: 'binance.com' },
  { name: 'steam', legitDomain: 'steampowered.com' },
  { name: 'discord', legitDomain: 'discord.com' },
  { name: 'walmart', legitDomain: 'walmart.com' },
];

// Keywords commonly found in phishing URLs
const SUSPICIOUS_URL_KEYWORDS = [
  'verify', 'verification', 'login', 'signin', 'sign-in', 'security',
  'account-suspended', 'update-billing', 'password-reset', 'recover',
  'wallet', 'claim-reward', 'bonus', 'unlock', '2fa', 'authenticate',
  'confirm-identity', 'reactivate', 'passcode', 'webscr', 'cmd=_login',
  'portal-security', 'secure-banking', 'account', 'banking'
];

/**
 * Normalizes leetspeak and common character substitution disguises (e.g., 0 -> o, 1 -> l)
 */
function normalizeLeetspeak(str: string): string {
  const map: Record<string, string> = {
    '0': 'o',
    '1': 'l',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '8': 'b',
    '@': 'a',
    '$': 's',
  };
  let result = str.toLowerCase();
  for (const [char, replacement] of Object.entries(map)) {
    result = result.split(char).join(replacement);
  }
  return result;
}

/**
 * Computes Levenshtein edit distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = new Array(a.length + 1);
  for (let j = 0; j <= a.length; j++) {
    row[j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    let prev = i;
    for (let j = 1; j <= a.length; j++) {
      let val: number;
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, Math.min(prev + 1, row[j] + 1));
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[a.length] = prev;
  }
  return row[a.length];
}

/**
 * URL Phishing Heuristic Engine
 */
export function analyzeUrl(rawUrl: string): ScanResult {
  const trimmed = rawUrl.trim();
  let parsedUrl: URL | null = null;
  let normalizedUrl = trimmed;

  // Add protocol if user omitted it
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  try {
    parsedUrl = new URL(normalizedUrl);
  } catch (err) {
    // Malformed URL
    return {
      id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      type: 'url',
      title: trimmed.slice(0, 50),
      inputPreview: trimmed.slice(0, 100),
      riskScore: 75,
      riskLevel: 'HIGH RISK',
      warningSigns: [
        'Invalid or unparseable URL structure',
        'Malformed domain syntax detected'
      ],
      safeSigns: [],
      reasons: ['The URL syntax is malformed, which is frequently used to exploit parser differentials.'],
      recommendedActions: [
        'Do not visit this address in your browser.',
        'Never paste malformed links into your address bar.'
      ],
      explanation: 'The provided URL does not conform to RFC standards and could not be safely resolved.',
      timestamp: Date.now(),
    };
  }

  let score = 0;
  const warningSigns: string[] = [];
  const safeSigns: string[] = [];
  const reasons: string[] = [];

  const hostname = parsedUrl.hostname.toLowerCase();
  const protocol = parsedUrl.protocol.toLowerCase();
  const fullPath = (parsedUrl.pathname + parsedUrl.search).toLowerCase();

  // 1. Protocol Check
  if (protocol === 'http:') {
    score += 25;
    warningSigns.push('Unencrypted connection (HTTP instead of HTTPS)');
    reasons.push('Uses unencrypted HTTP, exposing any submitted data to network eavesdropping.');
  } else if (protocol === 'https:') {
    safeSigns.push('Uses HTTPS encryption transport protocol');
  }

  // 2. IP Address as Host
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const isIpv4 = ipv4Regex.test(hostname);
  const isIpv6 = hostname.startsWith('[') && hostname.endsWith(']');
  if (isIpv4 || isIpv6) {
    score += 45;
    warningSigns.push('IP address used directly as host instead of registered domain');
    reasons.push('Phishing kits often use raw IP addresses to bypass domain reputation checks and domain takedowns.');
  }

  // 3. Port Check
  if (parsedUrl.port && !['80', '443'].includes(parsedUrl.port)) {
    score += 18;
    warningSigns.push(`Non-standard port detected: :${parsedUrl.port}`);
    reasons.push(`Legitimate consumer websites rarely run on custom non-standard ports like ${parsedUrl.port}.`);
  }

  // 4. @ Symbol (Userinfo in URL)
  if (rawUrl.includes('@')) {
    score += 40;
    warningSigns.push('Contains "@" symbol in address, which can spoof the actual destination domain');
    reasons.push('The "@" character in URLs causes browsers to treat everything before it as login credentials and navigates to the host after it.');
  }

  // 5. TLD Risk Check
  const parts = hostname.split('.');
  const tld = parts[parts.length - 1];
  if (SUSPICIOUS_TLDS.has(tld)) {
    score += 25;
    warningSigns.push(`Suspicious Top-Level Domain (TLD) ".${tld}"`);
    reasons.push(`The ".${tld}" extension has a very high correlation with disposable phishing and malware infrastructure.`);
  } else if (['gov', 'edu', 'org', 'mil'].includes(tld)) {
    safeSigns.push(`Uses official recognized institutional TLD: .${tld}`);
  }

  // 6. Subdomain Depth
  if (parts.length >= 4 && !isIpv4) {
    score += 15;
    warningSigns.push(`Deeply nested subdomains (${parts.length - 1} levels)`);
    reasons.push('Excessive subdomains are frequently arranged to push the actual domain off mobile browser address bars.');
  }

  // 7. Advanced Brand Impersonation, Typosquatting & Leetspeak Detection
  let brandImpersonated: string | null = null;
  const rootDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
  const normalizedHost = normalizeLeetspeak(hostname);
  const hostTokens = hostname.split(/[\.-]/).filter((t) => t.length > 0);
  const normalizedTokens = hostTokens.map((t) => normalizeLeetspeak(t));

  for (const brand of TARGET_BRANDS) {
    // If the registered root domain is the brand's authentic domain, it is genuine
    if (rootDomain === brand.legitDomain || hostname.endsWith('.' + brand.legitDomain)) {
      continue;
    }

    // A. Direct Brand Substring Mention (e.g., google.com.example.com or google-login.example.com)
    if (hostname.includes(brand.name)) {
      brandImpersonated = brand.name;
      score += 50;
      warningSigns.push(
        `Brand impersonation detected: Displays "${brand.name.toUpperCase()}" on unauthorized domain (${rootDomain})`
      );
      reasons.push(
        `The authentic website for ${brand.name.toUpperCase()} is "${brand.legitDomain}", but this URL points to "${rootDomain}". Attackers use trusted brand names in subdomains or hostnames to deceive users.`
      );
      break;
    }

    // B. Character Substitution / Leetspeak Spoofing (e.g., g00gle-login.example.com or paypa1-update.com)
    if (normalizedHost.includes(brand.name)) {
      brandImpersonated = brand.name;
      score += 55;
      warningSigns.push(
        `Lookalike typosquatting detected: Spoofs "${brand.name.toUpperCase()}" using character substitution (e.g. 0 for o, 1 for l)`
      );
      reasons.push(
        `The hostname mimics the brand "${brand.name.toUpperCase()}" using character substitutions (leetspeak). The registered root domain is "${rootDomain}" rather than the authentic "${brand.legitDomain}".`
      );
      break;
    }

    // C. Fuzzy Typosquatting / Edit-Distance (e.g., gooogle, paypall, amazn, netfllx)
    for (const token of normalizedTokens) {
      if (token.length >= 4 && brand.name.length >= 4) {
        const dist = levenshteinDistance(token, brand.name);
        const maxAllowed = brand.name.length >= 7 ? 2 : 1;
        if (dist > 0 && dist <= maxAllowed) {
          brandImpersonated = brand.name;
          score += 48;
          warningSigns.push(
            `Typosquatting variation detected: "${token}" closely resembles brand "${brand.name.toUpperCase()}"`
          );
          reasons.push(
            `The host token "${token}" is an intentional misspelling of "${brand.name.toUpperCase()}". The address resolves to "${rootDomain}" instead of "${brand.legitDomain}".`
          );
          break;
        }
      }
    }

    if (brandImpersonated) {
      break;
    }
  }

  if (!brandImpersonated) {
    safeSigns.push('No recognized brand impersonation detected in domain structure');
  }

  // 8. Suspicious Keywords in Path/Search or Subdomain
  const detectedKeywords: string[] = [];
  for (const kw of SUSPICIOUS_URL_KEYWORDS) {
    if (fullPath.includes(kw) || hostname.includes(kw)) {
      detectedKeywords.push(kw);
    }
  }
  if (detectedKeywords.length >= 2) {
    score += 25;
    warningSigns.push(`Contains high-risk phishing trigger words: ${detectedKeywords.slice(0, 3).join(', ')}`);
    reasons.push(`Keywords suggesting urgent login, verification, or credential updates were detected in the address.`);
  } else if (detectedKeywords.length === 1) {
    score += 15;
    warningSigns.push(`Contains credential-related keyword: "${detectedKeywords[0]}"`);
    reasons.push(`Address includes the credential-related term "${detectedKeywords[0]}". Legitimate services should be verified carefully.`);
  }

  // 9. Punycode / Internationalized Domain Lookalikes
  if (hostname.includes('xn--')) {
    score += 35;
    warningSigns.push('Punycode domain (xn--) detected — potential homograph attack');
    reasons.push('Punycode is frequently used to spoof characters that look identical to genuine letters (e.g., Cyrillic "а" instead of Latin "a").');
  }

  // 10. URL Length Anomaly
  if (trimmed.length > 100) {
    score += 12;
    warningSigns.push(`Unusually long URL (${trimmed.length} characters)`);
    reasons.push('Overly complex or obfuscated URLs are often used to conceal real redirection endpoints.');
  }

  // 11. Encoding Obfuscation
  if (/%[0-9a-f]{2}/i.test(trimmed)) {
    const percentCount = (trimmed.match(/%/g) || []).length;
    if (percentCount > 3) {
      score += 15;
      warningSigns.push('Heavy hexadecimal URL encoding (%xx)');
      reasons.push('Excessive URL encoding is often used to hide keywords or destination hosts from basic security filters.');
    }
  }

  // Calculate final bounded score
  const finalScore = Math.min(Math.max(score, 0), 100);

  // Categorize
  let riskLevel: RiskLevel = 'LOW RISK';
  if (finalScore >= 55) {
    riskLevel = 'HIGH RISK';
  } else if (finalScore >= 25) {
    riskLevel = 'MEDIUM RISK';
  }

  // Recommendations
  const recommendedActions: string[] = [];
  if (riskLevel === 'HIGH RISK') {
    recommendedActions.push('DO NOT enter usernames, passwords, or personal details.');
    recommendedActions.push('Do not download or open any files from this address.');
    recommendedActions.push('If you already visited, close the tab and check your browser download history.');
  } else if (riskLevel === 'MEDIUM RISK') {
    recommendedActions.push('Carefully inspect the browser address bar before interacting.');
    recommendedActions.push('Navigate to the official service website directly rather than following this link.');
    recommendedActions.push('Do not proceed if the website requests your 2FA code or password.');
  } else {
    recommendedActions.push('No obvious phishing signatures were found in the URL syntax.');
    recommendedActions.push('Always ensure the website displays a valid lock icon and matches the authentic company address.');
  }

  const explanation =
    riskLevel === 'HIGH RISK'
      ? `This URL exhibits multiple high-confidence indicators of malicious phishing or fraudulent host infrastructure (Risk Score: ${finalScore}/100).`
      : riskLevel === 'MEDIUM RISK'
      ? `This URL has suspicious or unverified characteristics that require cautious evaluation before trust is granted (Risk Score: ${finalScore}/100).`
      : `Structural analysis identified standard domain hygiene and no immediate deceptive patterns (Risk Score: ${finalScore}/100).`;

  return {
    id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    type: 'url',
    title: hostname || trimmed.slice(0, 40),
    inputPreview: trimmed,
    riskScore: finalScore,
    riskLevel,
    warningSigns,
    safeSigns,
    reasons,
    recommendedActions,
    explanation,
    details: {
      hostname,
      protocol,
      port: parsedUrl.port || 'default',
      isIpHost: isIpv4 || isIpv6,
      tld,
      subdomainLevels: parts.length - 1,
    },
    timestamp: Date.now(),
  };
}

/**
 * Email Phishing Analysis Engine
 */
export function analyzeEmail(content: string): ScanResult {
  const text = content.trim();
  const lower = text.toLowerCase();

  let score = 0;
  const warningSigns: string[] = [];
  const safeSigns: string[] = [];
  const reasons: string[] = [];

  // 1. Urgency / Threatening Language
  const urgencyPatterns = [
    'immediate action required', 'account suspended', 'account will be terminated',
    'within 24 hours', 'within 48 hours', 'final notice', 'legal action',
    'arrest warrant', 'unauthorized transaction', 'suspicious login detected',
    'failure to respond', 'act now', 'urgent attention', 'security compromised'
  ];
  const detectedUrgency = urgencyPatterns.filter(p => lower.includes(p));
  if (detectedUrgency.length >= 2) {
    score += 35;
    warningSigns.push(`Severe artificial urgency detected: "${detectedUrgency.slice(0, 2).join('", "')}"`);
    reasons.push('Scammers rely on manufactured urgency and threats to trigger panic before you have time to think.');
  } else if (detectedUrgency.length === 1) {
    score += 18;
    warningSigns.push(`Time-sensitive pressure detected: "${detectedUrgency[0]}"`);
    reasons.push('Urgent timeframes are a common social engineering mechanism.');
  }

  // 2. Credential / Sensitive Data Requests
  const credentialPatterns = [
    'verify your password', 'enter your password', 'provide your otp',
    'one-time password', 'verification code', '2fa code', 'social security number',
    'ssn', 'atm pin', 'secret phrase', 'recovery words', 'send password'
  ];
  const detectedCredentials = credentialPatterns.filter(p => lower.includes(p));
  if (detectedCredentials.length > 0) {
    score += 45;
    warningSigns.push(`Requests confidential credentials: "${detectedCredentials.join('", "')}"`);
    reasons.push('Legitimate organizations never ask you to reply with passwords, PINs, or 2FA codes.');
  }

  // 3. Financial / Wire / Payment / Invoice Coercion
  const financialPatterns = [
    'wire transfer', 'gift card', 'bitcoin', 'crypto payment', 'western union',
    'unpaid invoice attached', 'overdue payment', 'direct deposit update',
    'payroll information', 'tax refund claim', 'reimbursement of $'
  ];
  const detectedFinancial = financialPatterns.filter(p => lower.includes(p));
  if (detectedFinancial.length > 0) {
    score += 28;
    warningSigns.push(`Suspicious payment or invoice demand: "${detectedFinancial.join('", "')}"`);
    reasons.push('Unsolicited invoice demands and unusual payment methods (e.g. crypto, gift cards) are typical of payment diversion fraud.');
  }

  // 4. Impersonation / Generic Greetings
  const genericGreetings = [
    'dear customer', 'dear client', 'dear user', 'dear valued member',
    'dear email owner', 'dear friend', 'attention account holder'
  ];
  if (genericGreetings.some(g => lower.includes(g))) {
    score += 15;
    warningSigns.push('Generic impersonal greeting (e.g., "Dear Customer")');
    reasons.push('Banks and service providers where you hold an active account address you by your real name.');
  }

  // 5. Look for URLs inside email
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const foundUrls = text.match(urlRegex) || [];
  if (foundUrls.length > 0) {
    let urlRiskFound = false;
    for (const u of foundUrls) {
      if (u.includes('bit.ly') || u.includes('tinyurl') || u.includes('t.co') || u.includes('.xyz') || u.includes('.top')) {
        urlRiskFound = true;
        break;
      }
    }
    if (urlRiskFound) {
      score += 25;
      warningSigns.push('Contains shortened or obfuscated destination hyperlinks');
      reasons.push('Shortened links mask the true server address where credentials or downloads may be hosted.');
    } else {
      warningSigns.push(`Email contains ${foundUrls.length} external link(s) to verify manually`);
    }
  } else {
    safeSigns.push('No suspicious external hyperlinks detected in body text');
  }

  // 6. Suspicious attachment keywords
  if (lower.includes('.exe') || lower.includes('.zip') || lower.includes('.scr') || lower.includes('.vbs') || lower.includes('enable macros')) {
    score += 40;
    warningSigns.push('Mentions dangerous executable or archive attachments');
    reasons.push('Instructions to open executable attachments or enable macros are classic delivery vectors for malware.');
  }

  // Calculate final score
  const finalScore = Math.min(Math.max(score, 5), 100);

  let riskLevel: RiskLevel = 'LOW RISK';
  if (finalScore >= 55) {
    riskLevel = 'HIGH RISK';
  } else if (finalScore >= 25) {
    riskLevel = 'MEDIUM RISK';
  }

  const recommendedActions: string[] = [];
  if (riskLevel === 'HIGH RISK') {
    recommendedActions.push('DO NOT reply, click links, or open attachments.');
    recommendedActions.push('Report this email as phishing to your mail provider.');
    recommendedActions.push('Never share passwords, OTP codes, or financial account credentials.');
  } else if (riskLevel === 'MEDIUM RISK') {
    recommendedActions.push('Inspect sender email address carefully for slight misspellings.');
    recommendedActions.push('Visit the company website directly rather than clicking links in the email.');
    recommendedActions.push('Verify any urgent payment or account requests via a known phone number.');
  } else {
    recommendedActions.push('Standard advice: Verify sender identity if sensitive transactions are mentioned.');
    recommendedActions.push('Never forward unsolicited emails with attachments.');
  }

  const explanation =
    riskLevel === 'HIGH RISK'
      ? `High-risk phishing indicators detected (Risk Score: ${finalScore}/100). The email uses aggressive social engineering techniques.`
      : riskLevel === 'MEDIUM RISK'
      ? `Suspicious patterns detected (Risk Score: ${finalScore}/100). The message exhibits pressure tactics or unverified requests.`
      : `No immediate high-risk phishing signatures found in text (Risk Score: ${finalScore}/100). Always exercise standard email caution.`;

  return {
    id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    type: 'email',
    title: text.slice(0, 40) + '...',
    inputPreview: text.slice(0, 120),
    riskScore: finalScore,
    riskLevel,
    warningSigns,
    safeSigns,
    reasons,
    recommendedActions,
    explanation,
    timestamp: Date.now(),
  };
}

/**
 * Mobile / SMS / Scam Message Analysis Engine
 */
export function analyzeMessage(content: string): ScanResult {
  const text = content.trim();
  const lower = text.toLowerCase();

  let score = 0;
  const warningSigns: string[] = [];
  const safeSigns: string[] = [];
  const reasons: string[] = [];

  // 1. Delivery / Postal / Smishing Scams
  const deliveryPatterns = ['usps', 'fedex', 'ups', 'package delivery', 'postal address incomplete', 'redelivery fee', 'customs fee'];
  if (deliveryPatterns.some(p => lower.includes(p))) {
    score += 35;
    warningSigns.push('Package delivery redelivery or fee payment trap (Postal Smishing)');
    reasons.push('Fake delivery notifications are used to collect payment card details through counterfeit tracking portals.');
  }

  // 2. Urgent Bank Alert / Unauthorized Charge
  const bankPatterns = ['bank fraud', 'card blocked', 'unauthorized charge', 'zelle', 'wire transfer', 'account locked', 'transaction of $'];
  if (bankPatterns.some(p => lower.includes(p))) {
    score += 35;
    warningSigns.push('Financial account freeze or urgent transaction coercion');
    reasons.push('Impersonating bank fraud alerts pressures victims into calling fake hotlines or clicking phishing links.');
  }

  // 3. Fake Prize / Lottery / Crypto Giveaways
  const prizePatterns = ['congratulations', 'won a prize', 'claim your gift', 'free bitcoin', 'bonus payout', 'selected winner'];
  if (prizePatterns.some(p => lower.includes(p))) {
    score += 35;
    warningSigns.push('Unsolicited lottery, prize, or giveaway offer');
    reasons.push('Offers of unexpected free rewards or crypto are lures designed to harvest personal information.');
  }

  // 4. Remote Job / Easy Money / Telegram task scams
  const jobPatterns = ['daily salary', 'work from home', 'part-time job', 'telegram', 'review products', '$200-$500/day'];
  if (jobPatterns.some(p => lower.includes(p))) {
    score += 30;
    warningSigns.push('Task-based remote job or unrealistic daily earnings scam');
    reasons.push('Scammers lure job-seekers into prepaid task assignments before withholding deposited funds.');
  }

  // 5. Shortened / Obfuscated Link in SMS
  if (/https?:\/\//i.test(text)) {
    score += 20;
    warningSigns.push('Contains hyperlink inside mobile text message');
    reasons.push('Banks and government agencies do not send clickable links to resolve security alerts via SMS.');
  }

  // 6. OTP / Verification Code Phishing
  if (lower.includes('otp') || lower.includes('code') || lower.includes('do not share')) {
    score += 25;
    warningSigns.push('Mentions authentication or one-time passcode verification');
    reasons.push('Attackers attempt to trigger 2FA prompts and coax victims into revealing authorization tokens.');
  }

  const finalScore = Math.min(Math.max(score, 5), 100);

  let riskLevel: RiskLevel = 'LOW RISK';
  if (finalScore >= 55) {
    riskLevel = 'HIGH RISK';
  } else if (finalScore >= 25) {
    riskLevel = 'MEDIUM RISK';
  }

  const recommendedActions: string[] = [];
  if (riskLevel === 'HIGH RISK') {
    recommendedActions.push('DO NOT click any link in this message.');
    recommendedActions.push('Do not reply — replying confirms your phone number is active.');
    recommendedActions.push('Block the sender and report message as junk.');
  } else if (riskLevel === 'MEDIUM RISK') {
    recommendedActions.push('Never give out OTPs, passwords, or PINs over SMS.');
    recommendedActions.push('Navigate independently to the company app or website.');
  } else {
    recommendedActions.push('Verify sender if unsolicited links or requests are attached.');
  }

  const explanation =
    riskLevel === 'HIGH RISK'
      ? `High-confidence mobile scam signature detected (Risk Score: ${finalScore}/100). The message uses classic smishing patterns.`
      : riskLevel === 'MEDIUM RISK'
      ? `Suspicious characteristics detected (Risk Score: ${finalScore}/100). Verify with the official company before acting.`
      : `No immediate scam patterns detected in text message (Risk Score: ${finalScore}/100).`;

  return {
    id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    type: 'message',
    title: text.slice(0, 40) + '...',
    inputPreview: text.slice(0, 120),
    riskScore: finalScore,
    riskLevel,
    warningSigns,
    safeSigns,
    reasons,
    recommendedActions,
    explanation,
    timestamp: Date.now(),
  };
}
