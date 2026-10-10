import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Extension ZIP download endpoint
app.get('/api/download-extension', (_req, res) => {
  const zipPath = path.resolve(__dirname, 'public/phishcode-ai-chrome-extension.zip');
  res.download(zipPath, 'phishcode-ai-chrome-extension.zip', (err) => {
    if (err) {
      console.error('Failed to send extension zip:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download extension archive' });
      }
    }
  });
});

// AI Cybersecurity Assistant Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be text.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY || !aiClient) {
      // Graceful offline cybersecurity advisory when API key is not yet set
      const offlineGuidance = getOfflineCybersecurityAdvice(message);
      res.json({
        reply: offlineGuidance,
        source: 'local_knowledgebase',
        note: 'AI assistant is operating in local cybersecurity knowledgebase mode. Connect a Gemini API key in Secrets for custom reasoning.',
      });
      return;
    }

    const systemInstruction = `You are PhishCode AI's friendly, highly knowledgeable Cybersecurity Assistant for everyday users and students.
Your mission is to provide clear, human-centered, trustworthy advice on digital safety, phishing detection, scams, passwords, malware, and privacy.
Guidelines:
1. Always communicate in simple, warm, jargon-free language suitable for non-technical users.
2. If the user asks about an email, SMS, or link, help them spot red flags (urgency, spoofed domains, OTP requests, unsolicited attachments).
3. Emphasize that legitimate banks, government agencies, and tech companies NEVER ask for OTPs, passwords, or remote desktop access.
4. If a user has already clicked a suspicious link or given out credentials, provide clear immediate incident triage steps:
   - Disconnect internet if malware is suspected
   - Change compromised passwords from a clean device
   - Enable Multi-Factor Authentication (MFA)
   - Contact bank fraud department if financial data was involved
5. Do NOT present conclusions as 100% infallible guarantees; encourage healthy verification habits.
6. Keep answers concise, actionable, and formatted with clean bullet points.`;

    // Construct conversation contents
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.role === 'user' || item.role === 'model') {
          contents.push({
            role: item.role,
            parts: [{ text: String(item.text) }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const reply = response.text || 'I could not generate a response. Please try again.';
    res.json({ reply, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    // Return friendly security fallback instead of crashing
    const fallback = getOfflineCybersecurityAdvice(req.body?.message || '');
    res.json({
      reply: fallback,
      source: 'local_fallback',
      warning: 'AI cloud service was temporarily unavailable, so our built-in cybersecurity rules responded.',
    });
  }
});

// Optional deep AI analysis endpoint for suspicious content
app.post('/api/analyze-ai', async (req, res) => {
  try {
    const { type, content } = req.body;
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: 'Content is required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY || !aiClient) {
      res.status(503).json({
        error: 'Gemini API is not configured. Heuristic engine will handle scanning.',
      });
      return;
    }

    const prompt = `Perform an objective, calm cybersecurity evaluation of this ${type || 'input'}:
"${content.slice(0, 1500)}"

Respond in pure valid JSON without markdown wrapping. Format:
{
  "riskLevel": "LOW RISK" | "MEDIUM RISK" | "HIGH RISK",
  "riskScore": number (0 to 100),
  "summary": "1-2 sentence plain text assessment",
  "warningSigns": ["detected red flag 1", "detected red flag 2"],
  "recommendedActions": ["step 1", "step 2"],
  "explanation": "Why this risk level was assigned"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text || '{}';
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/analyze-ai:', error);
    res.status(500).json({ error: 'Failed to run AI analysis' });
  }
});

// Real URL Scanning Backend API Endpoint
app.post('/api/scan-url', (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: 'A target URL string is required.' });
      return;
    }

    const trimmed = url.trim();
    if (/^(javascript|data|vbscript):/i.test(trimmed)) {
      res.status(400).json({ success: false, error: 'Invalid URL scheme. Only HTTP and HTTPS addresses are supported.' });
      return;
    }

    let parsed: URL;
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }

    try {
      parsed = new URL(normalized);
    } catch {
      res.status(400).json({ success: false, error: 'The provided URL could not be parsed as a valid address.' });
      return;
    }

    const host = parsed.hostname.toLowerCase();
    const proto = parsed.protocol.toLowerCase();
    const fullPath = (parsed.pathname + parsed.search).toLowerCase();

    let score = 0;
    const warningSigns: string[] = [];
    const safeSigns: string[] = [];
    const reasons: string[] = [];

    // Protocol
    if (proto === 'http:') {
      score += 25;
      warningSigns.push('Unencrypted connection (HTTP instead of HTTPS)');
      reasons.push('Uses unencrypted HTTP, exposing data to potential interception.');
    } else if (proto === 'https:') {
      safeSigns.push('Uses HTTPS encryption transport protocol');
    }

    // IP as host
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || (host.startsWith('[') && host.endsWith(']'));
    if (isIp) {
      score += 45;
      warningSigns.push('IP address host detected instead of domain name');
      reasons.push('Phishing kits often use raw IP addresses to bypass domain reputation checks.');
    }

    // Non-standard port
    if (parsed.port && !['80', '443'].includes(parsed.port)) {
      score += 18;
      warningSigns.push(`Non-standard port detected: :${parsed.port}`);
      reasons.push(`Legitimate consumer websites rarely operate on custom port ${parsed.port}.`);
    }

    // @ symbol
    if (trimmed.includes('@')) {
      score += 40;
      warningSigns.push('Contains "@" character in address, which can spoof destination host');
      reasons.push('Browser credential syntax with "@" disguises the actual target domain.');
    }

    // Suspicious TLDs
    const suspiciousTlds = new Set(['xyz', 'top', 'tk', 'zip', 'mov', 'cam', 'gq', 'cf', 'ml', 'ga', 'click', 'buzz', 'rest', 'shop', 'work', 'fit', 'surf', 'sbs', 'cfd', 'icu', 'monster']);
    const parts = host.split('.');
    const tld = parts[parts.length - 1];
    if (suspiciousTlds.has(tld)) {
      score += 25;
      warningSigns.push(`Suspicious Top-Level Domain (TLD) ".${tld}"`);
      reasons.push(`The ".${tld}" extension has a high statistical correlation with disposable phishing campaigns.`);
    } else if (['gov', 'edu', 'org'].includes(tld)) {
      safeSigns.push(`Uses official recognized institutional TLD: .${tld}`);
    }

    // Subdomain nesting
    if (parts.length >= 4 && !isIp) {
      score += 15;
      warningSigns.push(`Deeply nested subdomains (${parts.length - 1} levels)`);
      reasons.push('Subdomain chains are frequently used to disguise the real domain on mobile address bars.');
    }

    // Brand impersonation & Lookalike Typosquatting
    const brands = [
      { name: 'paypal', legitDomain: 'paypal.com' },
      { name: 'google', legitDomain: 'google.com' },
      { name: 'apple', legitDomain: 'apple.com' },
      { name: 'microsoft', legitDomain: 'microsoft.com' },
      { name: 'netflix', legitDomain: 'netflix.com' },
      { name: 'amazon', legitDomain: 'amazon.com' },
      { name: 'chase', legitDomain: 'chase.com' },
      { name: 'bankofamerica', legitDomain: 'bankofamerica.com' },
      { name: 'wellsfargo', legitDomain: 'wellsfargo.com' },
      { name: 'usps', legitDomain: 'usps.com' },
      { name: 'fedex', legitDomain: 'fedex.com' },
      { name: 'irs', legitDomain: 'irs.gov' },
      { name: 'coinbase', legitDomain: 'coinbase.com' },
      { name: 'binance', legitDomain: 'binance.com' },
    ];

    const leetMap: Record<string, string> = {
      '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's'
    };
    let normHost = host;
    for (const [k, v] of Object.entries(leetMap)) {
      normHost = normHost.split(k).join(v);
    }
    const hostTokens = host.split(/[\.-]/).filter(t => t.length > 0);
    const normTokens = hostTokens.map(t => {
      let nt = t;
      for (const [k, v] of Object.entries(leetMap)) {
        nt = nt.split(k).join(v);
      }
      return nt;
    });

    const rootDomain = parts.length >= 2 ? parts.slice(-2).join('.') : host;
    let brandImpersonated = false;

    for (const b of brands) {
      if (rootDomain === b.legitDomain || host.endsWith('.' + b.legitDomain)) {
        continue;
      }

      // Exact brand in host
      if (host.includes(b.name)) {
        brandImpersonated = true;
        score += 50;
        warningSigns.push(`Appears to impersonate "${b.name.toUpperCase()}" on an unauthorized domain (${rootDomain})`);
        reasons.push(`The brand "${b.name}" appears in the URL, but the registered domain is actually "${rootDomain}".`);
        break;
      }

      // Leetspeak character substitution
      if (normHost.includes(b.name)) {
        brandImpersonated = true;
        score += 55;
        warningSigns.push(`Lookalike typosquatting detected: Spoofs "${b.name.toUpperCase()}" using character substitution`);
        reasons.push(`The address mimics the brand "${b.name.toUpperCase()}" via character substitution (e.g. 0 for o). Registered root domain is "${rootDomain}" rather than "${b.legitDomain}".`);
        break;
      }

      // Edit distance typosquatting
      for (const token of normTokens) {
        if (token.length >= 4 && b.name.length >= 4) {
          const maxAllowed = b.name.length >= 7 ? 2 : 1;
          // Simple distance check
          let diff = 0;
          if (Math.abs(token.length - b.name.length) <= maxAllowed) {
            // Check character overlap
            let matches = 0;
            for (let i = 0; i < Math.min(token.length, b.name.length); i++) {
              if (token[i] === b.name[i]) matches++;
            }
            if (matches >= b.name.length - maxAllowed && token !== b.name) {
              brandImpersonated = true;
              score += 48;
              warningSigns.push(`Typosquatting variation detected: "${token}" closely resembles brand "${b.name.toUpperCase()}"`);
              reasons.push(`The host token "${token}" is a lookalike variation of "${b.name.toUpperCase()}". Target domain is "${rootDomain}".`);
              break;
            }
          }
        }
      }

      if (brandImpersonated) break;
    }

    if (!brandImpersonated) {
      safeSigns.push('No recognized brand impersonation detected in domain structure');
    }

    // Keywords
    const keywords = ['login', 'signin', 'verify', 'verification', 'security', 'account-suspended', 'update-billing', 'password-reset', 'wallet', 'claim', 'bonus', '2fa'];
    const matches = keywords.filter((k) => fullPath.includes(k) || host.includes(k));
    if (matches.length >= 2) {
      score += 25;
      warningSigns.push(`High-risk credential keywords: ${matches.slice(0, 3).join(', ')}`);
      reasons.push('Address includes multiple credential verification or urgent login trigger terms.');
    } else if (matches.length === 1) {
      score += 10;
      warningSigns.push(`Credential keyword detected: "${matches[0]}"`);
    }

    // Punycode
    if (host.includes('xn--')) {
      score += 35;
      warningSigns.push('Punycode domain (xn--) detected — potential homograph spoofing');
      reasons.push('Punycode is frequently used to disguise lookalike characters.');
    }

    const finalScore = Math.min(Math.max(score, 0), 100);
    let riskLevel: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' = 'LOW RISK';
    if (finalScore >= 55) {
      riskLevel = 'HIGH RISK';
    } else if (finalScore >= 25) {
      riskLevel = 'MEDIUM RISK';
    }

    const recommendedActions: string[] = [];
    if (riskLevel === 'HIGH RISK') {
      recommendedActions.push('DO NOT enter usernames, passwords, or personal details.');
      recommendedActions.push('Do not download or open any files from this address.');
    } else if (riskLevel === 'MEDIUM RISK') {
      recommendedActions.push('Carefully inspect the browser address bar before interacting.');
      recommendedActions.push('Navigate to the official service website directly rather than following this link.');
    } else {
      recommendedActions.push('No obvious phishing signatures were found in the URL syntax.');
      recommendedActions.push('Always ensure the website displays a valid lock icon and matches the authentic address.');
    }

    const result = {
      id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      type: 'url',
      title: host || trimmed.slice(0, 40),
      inputPreview: trimmed,
      riskScore: finalScore,
      riskLevel,
      warningSigns,
      safeSigns,
      reasons,
      recommendedActions,
      explanation: riskLevel === 'HIGH RISK'
        ? `This URL exhibits high-confidence indicators of deceptive phishing or untrusted host infrastructure (Risk Score: ${finalScore}/100).`
        : riskLevel === 'MEDIUM RISK'
        ? `This URL has suspicious characteristics requiring cautious verification before trust is granted (Risk Score: ${finalScore}/100).`
        : `Structural analysis identified standard domain hygiene and no deceptive patterns (Risk Score: ${finalScore}/100).`,
      timestamp: Date.now(),
    };

    res.json({ success: true, result });
  } catch (err: any) {
    console.error('Error in /api/scan-url:', err);
    res.status(500).json({ success: false, error: 'Internal scanning error: ' + (err?.message || 'Unknown error') });
  }
});

// Built-in intelligent cybersecurity advice helper
function getOfflineCybersecurityAdvice(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('otp') || q.includes('verification code') || q.includes('pin')) {
    return `**Critical Safety Rule: Never Share OTPs**\n\n• One-Time Passwords (OTPs) are the final barrier protecting your accounts.\n• No legitimate bank, courier, or tech support agent will ever ask you to read out or forward an OTP.\n• If someone called claiming they sent a code by accident, hang up immediately.\n• If you already sent a code, immediately log into that account and change your password.`;
  }

  if (q.includes('password') || q.includes('passphrase') || q.includes('login')) {
    return `**Password Security Essentials**\n\n• Use unique passphrases combining 4 random words (e.g., \`velvet-orbit-harbor-quilt\`).\n• Never reuse passwords between email, banking, and casual websites.\n• Use a reputable password manager (e.g., Bitwarden, 1Password, or Apple/Google Keychain).\n• Always turn on Multi-Factor Authentication (MFA), preferably using an authenticator app rather than SMS.`;
  }

  if (q.includes('sms') || q.includes('whatsapp') || q.includes('text message') || q.includes('package') || q.includes('delivery')) {
    return `**Spotting Smishing (SMS Scams)**\n\n• Fake package delivery alerts ("Unpaid shipping fee of $1.50") are currently the #1 mobile scam.\n• Banks do not send urgent links saying "Your debit card is suspended, click here".\n• Never click shortened links (\`bit.ly\`, \`tinyurl\`, or weird domains like \`.top\` / \`.xyz\`).\n• Verify directly by visiting the delivery carrier or bank app yourself.`;
  }

  if (q.includes('email') || q.includes('invoice') || q.includes('job') || q.includes('boss')) {
    return `**How to Verify Suspicious Emails**\n\n• Look closely at the sender's actual address, not just their display name (e.g., \`support@paypa1-security.com\` is fake).\n• Be wary of artificial urgency ("Account will be suspended in 24 hours").\n• Check for generic greetings ("Dear Valued Customer") instead of your real name.\n• Never download unexpected invoice attachments (\`.exe\`, \`.zip\`, \`.scr\`, or macro-enabled documents).`;
  }

  if (q.includes('bookmarklet') || q.includes('browser')) {
    return `**About the PhishCode AI Bookmarklet**\n\n• The bookmarklet is a lightweight, privacy-preserving tool you activate on-demand.\n• Unlike heavy extensions, it runs ONLY when you click it in your bookmarks bar.\n• It sends only the current tab's URL to PhishCode AI for heuristic analysis.\n• It never accesses your cookies, keystrokes, stored passwords, or background data.`;
  }

  return `**PhishCode AI Safety Advice**\n\nWhen evaluating any digital communication:\n1. **Stop & Pause**: Scammers rely on manufactured urgency and fear.\n2. **Check the Source**: Inspect domain spelling, subdomains, and sender addresses.\n3. **Do Not Click**: If in doubt, go directly to the official website by typing the address yourself.\n4. **Protect Credentials**: Never share 2FA codes, passwords, or remote desktop access.\n\nFeel free to paste suspicious text, an email excerpt, or ask any specific cybersecurity question!`;
}

// Development vs Production serving
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`PhishCode AI server running on http://0.0.0.0:${port}`);
  });
}

setupApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
