/**
 * PhishCode AI - Gmail Content Script (Manifest V3)
 * Runs locally on mail.google.com to detect opened emails and analyze:
 * - Sender address and display name
 * - Subject line
 * - Message body text
 * - Hyperlink destinations and hidden redirects
 *
 * Privacy Promise: All analysis executes 100% locally in browser memory.
 * No email bodies or sender addresses are transmitted externally.
 */

(function () {
  console.log('[PhishCode AI] Gmail Phishing Detector active.');

  // Known suspicious top-level domains frequently used in malicious infrastructure
  const SUSPICIOUS_TLDS = new Set([
    'xyz', 'top', 'tk', 'zip', 'mov', 'cam', 'gq', 'cf', 'ml', 'ga',
    'click', 'link', 'country', 'stream', 'download', 'racing', 'accountant',
    'date', 'faith', 'review', 'party', 'trade', 'bid', 'loan', 'win'
  ]);

  // Trusted corporate domains commonly spoofed in phishing lures
  const BRAND_SPECTRUM = [
    { name: 'Google', domain: 'google.com', emailDomains: ['google.com', 'googlemail.com'] },
    { name: 'PayPal', domain: 'paypal.com', emailDomains: ['paypal.com'] },
    { name: 'Microsoft', domain: 'microsoft.com', emailDomains: ['microsoft.com', 'office.com', 'live.com'] },
    { name: 'Apple', domain: 'apple.com', emailDomains: ['apple.com', 'icloud.com'] },
    { name: 'Amazon', domain: 'amazon.com', emailDomains: ['amazon.com'] },
    { name: 'Netflix', domain: 'netflix.com', emailDomains: ['netflix.com'] },
    { name: 'Chase Bank', domain: 'chase.com', emailDomains: ['chase.com'] },
    { name: 'Bank of America', domain: 'bankofamerica.com', emailDomains: ['bankofamerica.com'] },
    { name: 'Wells Fargo', domain: 'wellsfargo.com', emailDomains: ['wellsfargo.com'] },
    { name: 'IRS / Tax', domain: 'irs.gov', emailDomains: ['irs.gov'] },
    { name: 'DocuSign', domain: 'docusign.com', emailDomains: ['docusign.com', 'docusign.net'] },
    { name: 'Dropbox', domain: 'dropbox.com', emailDomains: ['dropbox.com'] }
  ];

  const BAD_KEYWORDS = [
    'verify', 'urgent', 'suspend', 'immediate', 'action required', 'compromised',
    'terminate', 'unauthorized', 'bitcoin', 'wire transfer', 'crypto', 'gift card',
    'tax refund', 'ssn', 'atm pin', 'password', 'one-time password', 'otp', '2fa code'
  ];

  let lastScannedId = null;
  let observer = null;

  /**
   * Main observer looking for opened email threads in Gmail's dynamic DOM
   */
  function initObserver() {
    if (observer) observer.disconnect();

    observer = new MutationObserver(debounce(checkForOpenEmail, 300));
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial check
    checkForOpenEmail();
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Inspect DOM for active email view in Gmail
   */
  function checkForOpenEmail() {
    // Gmail email message containers
    // Common selectors: .ii.gt (email body), .adn (message view), table.cf.gJ (sender area)
    const emailContainers = document.querySelectorAll('div[role="main"] div[role="listitem"], div.nH.if, div.ii.gt');
    if (!emailContainers.length) return;

    // Find the latest visible expanded email message body
    const visibleBodies = document.querySelectorAll('div.ii.gt div.a3s.aiL, div.ii.gt');
    if (!visibleBodies.length) return;

    const currentBodyEl = visibleBodies[visibleBodies.length - 1];
    if (!currentBodyEl || !currentBodyEl.innerText.trim()) return;

    // Check if we already injected into this email container
    const parentContainer = currentBodyEl.closest('div.adn') || currentBodyEl.closest('div[role="listitem"]') || currentBodyEl.parentElement;
    if (!parentContainer) return;

    if (parentContainer.querySelector('.phishcode-banner-container')) {
      return; // Already present
    }

    // Extract message fields
    const emailData = extractEmailDetails(parentContainer, currentBodyEl);
    if (!emailData.text && !emailData.subject && !emailData.senderEmail) return;

    // Perform full client-side heuristic inspection
    const analysis = analyzeEmailLocally(emailData);

    // Inject trustworthy security banner inside Gmail interface
    injectSecurityBanner(parentContainer, analysis, emailData);
  }

  /**
   * Extract sender, subject, links, and body from Gmail's rendered DOM
   */
  function extractEmailDetails(container, bodyEl) {
    // 1. Sender extraction
    let senderName = '';
    let senderEmail = '';

    // Look for Gmail sender elements (span.gD, span.go, email attributes)
    const senderEl = container.querySelector('span.gD') || document.querySelector('span.gD');
    if (senderEl) {
      senderName = senderEl.getAttribute('name') || senderEl.innerText || '';
      senderEmail = senderEl.getAttribute('email') || '';
    }

    if (!senderEmail) {
      const emailAttrEl = container.querySelector('[email]');
      if (emailAttrEl) senderEmail = emailAttrEl.getAttribute('email') || '';
    }

    // Fallback: look for span.go (email address display in parens)
    if (!senderEmail) {
      const goEl = container.querySelector('span.go');
      if (goEl) {
        const match = goEl.innerText.match(/<([^>]+)>/) || goEl.innerText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (match) senderEmail = match[1];
      }
    }

    // 2. Subject extraction
    let subject = '';
    const subjectEl = document.querySelector('h2.hP') || container.querySelector('h2.hP');
    if (subjectEl) {
      subject = subjectEl.innerText.trim();
    }

    // 3. Body text
    const text = bodyEl.innerText.trim();

    // 4. Links in email
    const linkEls = Array.from(bodyEl.querySelectorAll('a[href]'));
    const links = linkEls.map(a => {
      let rawHref = a.getAttribute('href') || '';
      // Gmail link redirection wrapper (https://www.google.com/url?q=...)
      let destination = rawHref;
      try {
        if (rawHref.includes('google.com/url?') || rawHref.includes('mail.google.com/url?')) {
          const parsed = new URL(rawHref);
          const qParam = parsed.searchParams.get('q');
          if (qParam) destination = qParam;
        }
      } catch (e) {}

      return {
        displayText: a.innerText.trim(),
        href: destination,
        rawHref: rawHref
      };
    }).filter(l => l.href && (l.href.startsWith('http://') || l.href.startsWith('https://')));

    return {
      senderName,
      senderEmail,
      subject,
      text,
      links
    };
  }

  /**
   * Comprehensive Local Heuristic Analysis Engine
   */
  function analyzeEmailLocally(data) {
    let score = 0;
    const warningSigns = [];
    const safeSigns = [];
    const reasons = [];
    const linkFindings = [];

    const lowerSubject = (data.subject || '').toLowerCase();
    const lowerBody = (data.text || '').toLowerCase();
    const combinedText = lowerSubject + ' ' + lowerBody;

    // --- 1. SENDER REPUTATION & BRAND SPOOFING ---
    let senderDomain = '';
    if (data.senderEmail && data.senderEmail.includes('@')) {
      senderDomain = data.senderEmail.split('@')[1].toLowerCase().trim();
    }

    let detectedBrand = null;
    for (const b of BRAND_SPECTRUM) {
      const brandWord = b.name.toLowerCase();
      if (
        data.senderName.toLowerCase().includes(brandWord) ||
        lowerSubject.includes(brandWord) ||
        lowerBody.includes(`from ${brandWord}`) ||
        lowerBody.includes(`team ${brandWord}`)
      ) {
        detectedBrand = b;
        break;
      }
    }

    if (detectedBrand && senderDomain) {
      const isAuthorizedSender = detectedBrand.emailDomains.some(d =>
        senderDomain === d || senderDomain.endsWith('.' + d)
      );

      if (!isAuthorizedSender) {
        score += 48;
        warningSigns.push(`Sender spoofing detected: Claims to represent "${detectedBrand.name}", but sent from @${senderDomain}`);
        reasons.push(`The email claims or implies it is from ${detectedBrand.name}, yet the genuine domain is ${detectedBrand.domain}. Legitimate companies never send security notices from foreign domains.`);
      } else {
        safeSigns.push(`Sender domain (@${senderDomain}) matches authentic ${detectedBrand.name} infrastructure`);
      }
    }

    // Check for lookalike characters or hyphens in sender domain
    if (senderDomain) {
      if (senderDomain.includes('-verify') || senderDomain.includes('-support') || senderDomain.includes('-security')) {
        score += 35;
        warningSigns.push(`Deceptive sender domain syntax: "@${senderDomain}"`);
        reasons.push('Scammers register domains with words like "support" or "verify" attached to real names to trick victims.');
      }

      const tld = senderDomain.split('.').pop();
      if (tld && SUSPICIOUS_TLDS.has(tld)) {
        score += 30;
        warningSigns.push(`Sender uses high-risk Top-Level Domain (.${tld})`);
      }
    }

    // --- 2. URGENCY & THREAT COERCION ---
    const urgencyPatterns = [
      'immediate action required', 'account suspended', 'account will be suspended',
      'terminated within 24 hours', 'within 48 hours', 'final notice', 'legal action',
      'unauthorized activity', 'login attempt detected', 'failure to verify', 'act immediately',
      'password expired', 'service cancellation'
    ];
    const foundUrgency = urgencyPatterns.filter(p => combinedText.includes(p));
    if (foundUrgency.length >= 2) {
      score += 35;
      warningSigns.push(`High artificial urgency detected: "${foundUrgency.slice(0, 2).join('", "')}"`);
      reasons.push('Manufactured deadlines and threats are used to trigger panic so you act before thinking.');
    } else if (foundUrgency.length === 1) {
      score += 18;
      warningSigns.push(`Time-sensitive pressure detected: "${foundUrgency[0]}"`);
    }

    // --- 3. CREDENTIAL & SENSITIVE DATA SOLICITATION ---
    const credPatterns = [
      'verify your password', 'confirm your password', 'provide your otp',
      'one-time password', 'verification code', '2fa code', 'social security number',
      'ssn', 'atm pin', 'secret recovery phrase', 'seed phrase', 'send your credentials'
    ];
    const foundCreds = credPatterns.filter(p => combinedText.includes(p));
    if (foundCreds.length > 0) {
      score += 45;
      warningSigns.push(`Requests sensitive credentials: "${foundCreds.join('", "')}"`);
      reasons.push('No legitimate provider will ask you to supply your password, OTP, or PIN via email or unverified forms.');
    }

    // --- 4. FINANCIAL / WIRE / INVOICE EXTORTION ---
    const finPatterns = [
      'wire transfer', 'gift card', 'bitcoin', 'crypto payment', 'western union',
      'invoice attached', 'overdue payment', 'direct deposit', 'tax refund', 'won a prize'
    ];
    const foundFin = finPatterns.filter(p => combinedText.includes(p));
    if (foundFin.length > 0) {
      score += 25;
      warningSigns.push(`Unusual financial or payment trigger: "${foundFin.join('", "')}"`);
    }

    // --- 5. HYPERLINK DESTINATION DECEPTION ---
    if (data.links && data.links.length > 0) {
      let deceptiveLinkCount = 0;
      data.links.forEach(link => {
        try {
          const parsed = new URL(link.href);
          const hostname = parsed.hostname.toLowerCase();
          const disp = link.displayText.toLowerCase();

          // Check for link display text mismatch (e.g. text says "paypal.com" but href points elsewhere)
          let mismatch = false;
          if ((disp.includes('http://') || disp.includes('https://') || disp.includes('.com') || disp.includes('.org')) && disp.length > 5) {
            if (!disp.includes(hostname)) {
              mismatch = true;
              deceptiveLinkCount++;
              score += 40;
              warningSigns.push(`Hidden destination mismatch: Link displays "${link.displayText.slice(0, 30)}" but directs to "${hostname}"`);
              reasons.push('Deceptive hyperlinks disguise their true target behind legitimate-looking anchor text.');
            }
          }

          // Check if link uses suspicious TLD
          const linkTld = hostname.split('.').pop();
          if (SUSPICIOUS_TLDS.has(linkTld)) {
            score += 25;
            warningSigns.push(`Hyperlink directs to suspicious domain ending in .${linkTld} (${hostname})`);
          }

          // Check if link uses IP address instead of domain
          if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
            score += 40;
            warningSigns.push(`Hyperlink uses numeric IP address host: ${hostname}`);
            reasons.push('Legitimate services do not link directly to bare IP addresses.');
          }

          linkFindings.push({
            displayText: link.displayText || '(No Text)',
            url: link.href,
            hostname: hostname,
            isSuspicious: mismatch || SUSPICIOUS_TLDS.has(linkTld)
          });
        } catch (e) {}
      });

      if (deceptiveLinkCount === 0 && linkFindings.length > 0) {
        safeSigns.push(`Inspected ${data.links.length} destination link(s); no hidden text-vs-target mismatches found`);
      }
    } else {
      safeSigns.push('Email contains zero external hyperlinks');
    }

    // Generic salutation check
    const genericGreetings = ['dear customer', 'dear client', 'dear user', 'dear email holder', 'dear friend'];
    if (genericGreetings.some(g => lowerBody.includes(g))) {
      score += 12;
      warningSigns.push('Generic impersonal salutation (e.g., "Dear Customer")');
    }

    // Final bounded score & classification
    const finalScore = Math.min(Math.max(score, 5), 100);

    let riskLevel = 'SAFE-LOOKING';
    if (finalScore >= 55) {
      riskLevel = 'HIGH RISK';
    } else if (finalScore >= 25) {
      riskLevel = 'SUSPICIOUS';
    }

    // Clear explanation
    let explanation = '';
    if (riskLevel === 'HIGH RISK') {
      explanation = `High-confidence phishing indicators detected (Risk Score: ${finalScore}/100). Do not click links, reply with credentials, or download attachments.`;
    } else if (riskLevel === 'SUSPICIOUS') {
      explanation = `Suspicious patterns detected (Risk Score: ${finalScore}/100). Exercise caution before interacting with any links or sender requests.`;
    } else {
      explanation = `Standard message hygiene observed (Risk Score: ${finalScore}/100). No blatant brand spoofing or known credential-theft signatures detected.`;
    }

    return {
      score: finalScore,
      riskLevel,
      explanation,
      warningSigns,
      safeSigns,
      reasons,
      linkFindings,
      timestamp: Date.now()
    };
  }

  /**
   * Inject visual security badge directly inside Gmail UI
   */
  function injectSecurityBanner(parentContainer, analysis, emailData) {
    // Remove existing if any
    const existing = parentContainer.querySelector('.phishcode-banner-container');
    if (existing) existing.remove();

    const bannerWrapper = document.createElement('div');
    bannerWrapper.className = 'phishcode-banner-container';

    // Theme colors per brand specifications
    let badgeBg = '#DDEBDD';
    let badgeText = '#315C3B';
    let badgeBorder = '#CAD8C5';
    let iconSymbol = '🛡️';

    if (analysis.riskLevel === 'HIGH RISK') {
      badgeBg = '#F3D8D4';
      badgeText = '#8A3028';
      badgeBorder = '#E5A8A0';
      iconSymbol = '🚨';
    } else if (analysis.riskLevel === 'SUSPICIOUS') {
      badgeBg = '#F5E6C8';
      badgeText = '#805B18';
      badgeBorder = '#E6C77A';
      iconSymbol = '⚠️';
    }

    const warningsHtml = analysis.warningSigns.length > 0
      ? `<div class="phishcode-reasons-title">Warning Signs Detected:</div>
         <ul class="phishcode-reasons-list">
           ${analysis.warningSigns.map(w => `<li><span class="bullet-warn">•</span> ${escapeHtml(w)}</li>`).join('')}
         </ul>`
      : '';

    const reasonsHtml = analysis.reasons.length > 0
      ? `<div class="phishcode-explanation-box">
           <strong>Security Insight:</strong> ${escapeHtml(analysis.reasons.join(' '))}
         </div>`
      : '';

    const safeHtml = analysis.safeSigns.length > 0 && analysis.riskLevel === 'SAFE-LOOKING'
      ? `<div class="phishcode-safe-signs">
           ${analysis.safeSigns.map(s => `<div>✓ ${escapeHtml(s)}</div>`).join('')}
         </div>`
      : '';

    bannerWrapper.innerHTML = `
      <div class="phishcode-card" style="border-left: 5px solid ${badgeBorder};">
        <div class="phishcode-header">
          <div class="phishcode-brand">
            <span class="phishcode-logo-icon">🛡️</span>
            <span class="phishcode-brand-name">PhishCode <strong>AI</strong></span>
            <span class="phishcode-tag">Gmail Shield</span>
          </div>
          <div class="phishcode-badge" style="background-color: ${badgeBg}; color: ${badgeText}; border: 1px solid ${badgeBorder};">
            <span>${iconSymbol}</span>
            <span>${analysis.riskLevel}</span>
            <span class="phishcode-score">(${analysis.score}/100)</span>
          </div>
        </div>

        <div class="phishcode-summary">
          ${escapeHtml(analysis.explanation)}
        </div>

        ${warningsHtml}
        ${reasonsHtml}
        ${safeHtml}

        <div class="phishcode-footer">
          <div class="phishcode-privacy-note">
            🔒 Evaluated 100% locally in browser memory. No email content was sent to external servers.
          </div>
          <button type="button" class="phishcode-details-toggle">View Details</button>
        </div>

        <div class="phishcode-details-drawer hidden">
          <div class="phishcode-meta-grid">
            <div><strong>Sender Address:</strong> ${escapeHtml(emailData.senderEmail || 'Hidden / Inferred')}</div>
            <div><strong>Subject:</strong> ${escapeHtml(emailData.subject || '(None)')}</div>
            <div><strong>Hyperlinks Found:</strong> ${emailData.links ? emailData.links.length : 0}</div>
          </div>
          ${analysis.linkFindings && analysis.linkFindings.length > 0 ? `
            <div class="phishcode-links-section">
              <strong>Inspected Destination Links:</strong>
              <ul>
                ${analysis.linkFindings.slice(0, 5).map(l => `
                  <li class="${l.isSuspicious ? 'link-sus' : ''}">
                    <span class="link-host">${escapeHtml(l.hostname)}</span>
                    <span class="link-dest">${escapeHtml(l.url.slice(0, 60))}...</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Hook up details toggle button
    const toggleBtn = bannerWrapper.querySelector('.phishcode-details-toggle');
    const drawer = bannerWrapper.querySelector('.phishcode-details-drawer');
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', function () {
        const isHidden = drawer.classList.contains('hidden');
        if (isHidden) {
          drawer.classList.remove('hidden');
          toggleBtn.textContent = 'Hide Details';
        } else {
          drawer.classList.add('hidden');
          toggleBtn.textContent = 'View Details';
        }
      });
    }

    // Insert banner above the message body
    const bodyContainer = parentContainer.querySelector('div.ii.gt') || parentContainer;
    bodyContainer.parentNode.insertBefore(bannerWrapper, bodyContainer);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start checking when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
