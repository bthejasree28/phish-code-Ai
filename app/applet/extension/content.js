/**
 * PhishCode AI - Gmail In-Browser Phishing Detector (Manifest V3)
 *
 * Runs 100% locally inside the browser on mail.google.com.
 * Never transmits email text, passwords, or personal credentials to external servers.
 */

(function () {
  'use strict';

  // Brands frequently impersonated in email phishing attacks
  const HIGH_TARGET_BRANDS = [
    { name: 'paypal', legitDomains: ['paypal.com'] },
    { name: 'google', legitDomains: ['google.com'] },
    { name: 'apple', legitDomains: ['apple.com', 'icloud.com'] },
    { name: 'microsoft', legitDomains: ['microsoft.com', 'outlook.com', 'office.com', 'live.com'] },
    { name: 'netflix', legitDomains: ['netflix.com'] },
    { name: 'amazon', legitDomains: ['amazon.com'] },
    { name: 'chase', legitDomains: ['chase.com'] },
    { name: 'bank of america', legitDomains: ['bankofamerica.com'] },
    { name: 'wells fargo', legitDomains: ['wellsfargo.com'] },
    { name: 'citibank', legitDomains: ['citi.com', 'citibank.com'] },
    { name: 'usps', legitDomains: ['usps.com'] },
    { name: 'fedex', legitDomains: ['fedex.com'] },
    { name: 'ups', legitDomains: ['ups.com'] },
    { name: 'dhl', legitDomains: ['dhl.com'] },
    { name: 'irs', legitDomains: ['irs.gov'] },
    { name: 'coinbase', legitDomains: ['coinbase.com'] },
    { name: 'binance', legitDomains: ['binance.com'] },
    { name: 'meta', legitDomains: ['meta.com', 'facebook.com', 'instagram.com'] },
    { name: 'facebook', legitDomains: ['facebook.com'] },
    { name: 'instagram', legitDomains: ['instagram.com'] },
  ];

  // Common free webmail domains that legitimate institutions do not use
  const FREE_WEBMAIL_DOMAINS = new Set([
    'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com',
    'hotmail.com', 'outlook.com', 'live.com', 'aol.com', 'icloud.com', 'mail.com'
  ]);

  // Suspicious TLDs
  const SUSPICIOUS_TLDS = new Set([
    'xyz', 'top', 'tk', 'zip', 'mov', 'cam', 'gq', 'cf', 'ml', 'ga',
    'click', 'buzz', 'rest', 'shop', 'work', 'fit', 'surf', 'sbs', 'cfd',
    'icu', 'monster', 'hair', 'bond', 'live', 'online', 'vip'
  ]);

  // Debounce scanning so rapid DOM mutations don't trigger redundant checks
  let scanDebounceTimer = null;

  function initObserver() {
    const observer = new MutationObserver(function () {
      if (scanDebounceTimer) clearTimeout(scanDebounceTimer);
      scanDebounceTimer = setTimeout(scanOpenEmails, 250);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also run an initial check
    scanOpenEmails();
    // Safety check every 2 seconds for new email views
    setInterval(scanOpenEmails, 2000);
  }

  /**
   * Identifies any visible open email message in Gmail
   */
  function scanOpenEmails() {
    // Gmail email message bodies are commonly contained in .a3s.aiL or .ii.gt
    const messageBodies = document.querySelectorAll('.ii.gt, .a3s.aiL');

    messageBodies.forEach(function (bodyEl) {
      // Find the main message wrapper
      const messageWrapper = bodyEl.closest('.gs, .adn, .ii.gt') || bodyEl;

      // Skip if already analyzed and banner is attached
      if (messageWrapper.dataset.phishcodeScanned === 'true') {
        return;
      }

      // Check if message has actual content
      const messageText = (bodyEl.innerText || '').trim();
      if (messageText.length < 10) {
        return;
      }

      // Extract Email Data
      const emailData = extractEmailDetails(messageWrapper, bodyEl);

      // Run 100% In-Browser Local Heuristic Phishing Scrutiny
      const result = analyzeEmailHeuristics(emailData);

      // Inject Banner directly into Gmail DOM
      injectPhishCodeBanner(messageWrapper, bodyEl, result, emailData);

      // Mark as scanned
      messageWrapper.dataset.phishcodeScanned = 'true';
    });
  }

  /**
   * Extracts Sender Name, Sender Email, Subject, Message Text, and Link Destinations
   */
  function extractEmailDetails(messageWrapper, bodyEl) {
    // 1. Sender extraction
    let senderName = '';
    let senderEmail = '';

    // Look for Gmail sender element (usually .gD or span[email])
    const senderEl = messageWrapper.querySelector('.gD, span[email], [data-hovercard-id]');
    if (senderEl) {
      senderEmail = (senderEl.getAttribute('email') || senderEl.getAttribute('data-hovercard-id') || '').trim();
      senderName = (senderEl.getAttribute('name') || senderEl.innerText || '').trim();
    }

    // Fallback if not found on messageWrapper: search thread container
    if (!senderEmail) {
      const threadEl = document.querySelector('.gD, span[email]');
      if (threadEl) {
        senderEmail = (threadEl.getAttribute('email') || '').trim();
        senderName = (threadEl.getAttribute('name') || threadEl.innerText || '').trim();
      }
    }

    // 2. Subject extraction
    let subject = '';
    const subjectEl = document.querySelector('h2.hP, .hP');
    if (subjectEl) {
      subject = subjectEl.innerText.trim();
    }

    // 3. Message Text
    const messageText = bodyEl.innerText || '';

    // 4. Link Destinations Extraction
    const links = [];
    const anchorElements = bodyEl.querySelectorAll('a[href]');
    anchorElements.forEach(function (a) {
      const href = a.getAttribute('href') || '';
      const text = (a.innerText || a.textContent || '').trim();
      if (href && !href.startsWith('mailto:') && !href.startsWith('#')) {
        links.push({ href: href, text: text });
      }
    });

    return {
      senderName: senderName,
      senderEmail: senderEmail,
      subject: subject,
      messageText: messageText,
      links: links,
    };
  }

  /**
   * 100% In-Browser Heuristic Analysis Engine
   */
  function analyzeEmailHeuristics(data) {
    let score = 0;
    const warnings = [];
    const cleanChecks = [];
    const actions = [];

    const lowerSubject = (data.subject || '').toLowerCase();
    const lowerBody = (data.messageText || '').toLowerCase();
    const lowerSenderName = (data.senderName || '').toLowerCase();
    const lowerSenderEmail = (data.senderEmail || '').toLowerCase();
    const combinedContent = lowerSubject + ' ' + lowerBody;

    const senderDomain = lowerSenderEmail.includes('@')
      ? lowerSenderEmail.split('@')[1]
      : '';

    // ----------------------------------------------------
    // 1. SENDER IDENTITY & BRAND SPOOFING CHECK
    // ----------------------------------------------------
    let brandClaimed = null;
    for (let i = 0; i < HIGH_TARGET_BRANDS.length; i++) {
      const b = HIGH_TARGET_BRANDS[i];
      const nameInSender = lowerSenderName.includes(b.name);
      const nameInSubject = lowerSubject.includes(b.name);

      if (nameInSender || (nameInSubject && (lowerSubject.includes('support') || lowerSubject.includes('security') || lowerSubject.includes('alert')))) {
        brandClaimed = b;
        const isLegitDomain = b.legitDomains.some(function (d) {
          return senderDomain === d || senderDomain.endsWith('.' + d);
        });

        if (!isLegitDomain && senderDomain) {
          score += 48;
          warnings.push(
            'Brand Impersonation: Claims to be "' + b.name.toUpperCase() +
            '", but actual sender email is from unverified domain ("' + senderDomain + '").'
          );
          if (FREE_WEBMAIL_DOMAINS.has(senderDomain)) {
            score += 15;
            warnings.push(
              'Free Webmail Address: Legitimate organizations never send official account notices from free public domains (e.g., @' + senderDomain + ').'
            );
          }
          break;
        }
      }
    }

    if (!brandClaimed && senderDomain) {
      cleanChecks.push('Sender identity appears consistent with declared domain (' + senderDomain + ')');
    }

    // Check if sender domain uses suspicious TLD
    if (senderDomain) {
      const sParts = senderDomain.split('.');
      const sTld = sParts[sParts.length - 1];
      if (SUSPICIOUS_TLDS.has(sTld)) {
        score += 30;
        warnings.push('High-Risk Sender Domain Extension: ".' + sTld + '" is frequently used in disposable phishing.');
      }
    }

    // ----------------------------------------------------
    // 2. LINK DESTINATION DECEPTION (Mismatched Text vs URL)
    // ----------------------------------------------------
    let mismatchedLinkCount = 0;
    let suspiciousLinkCount = 0;

    data.links.forEach(function (link) {
      const href = link.href.trim();
      const text = link.text.trim();

      // Check for mismatched destination (e.g. text says paypal.com but href goes elsewhere)
      if (text.includes('.com') || text.includes('.org') || text.includes('.net') || text.includes('http')) {
        try {
          const hrefParsed = new URL(href);
          const hrefHost = hrefParsed.hostname.toLowerCase();
          
          // If text appears to be a domain/URL
          const textMatch = text.match(/(?:https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (textMatch && textMatch[1]) {
            const displayedHost = textMatch[1].toLowerCase();
            if (!hrefHost.includes(displayedHost) && !displayedHost.includes(hrefHost)) {
              mismatchedLinkCount++;
              score += 45;
              warnings.push(
                'Deceptive Link: Visible link displays "' + displayedHost + '", but actual destination leads to "' + hrefHost + '".'
              );
            }
          }
        } catch (e) {}
      }

      // Check destination host for IP address, high-risk TLDs
      try {
        const parsed = new URL(href);
        const host = parsed.hostname.toLowerCase();

        // Raw IP
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
          score += 40;
          suspiciousLinkCount++;
          warnings.push('Raw IP Link: Email link points directly to IP address (' + host + ') instead of a registered domain.');
        }

        // Suspicious TLD
        const parts = host.split('.');
        const tld = parts[parts.length - 1];
        if (SUSPICIOUS_TLDS.has(tld)) {
          score += 25;
          suspiciousLinkCount++;
          warnings.push('Suspicious Link Domain: Links to high-risk extension ".' + tld + '" (' + host + ').');
        }

        // Unencrypted HTTP link for sensitive verbs
        if (parsed.protocol === 'http:' && (lowerBody.includes('login') || lowerBody.includes('verify') || lowerBody.includes('password'))) {
          score += 20;
          warnings.push('Insecure Link: Email instructs action using unencrypted HTTP connection.');
        }

        // URL shortener
        if (['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'rb.gy'].includes(host)) {
          score += 18;
          warnings.push('Obfuscated Short Link: Uses URL shortener (' + host + ') hiding actual destination.');
        }
      } catch (err) {}
    });

    if (data.links.length > 0 && mismatchedLinkCount === 0 && suspiciousLinkCount === 0) {
      cleanChecks.push('All hyperlinks (' + data.links.length + ') appear consistently labeled with standard HTTPS destinations');
    } else if (data.links.length === 0) {
      cleanChecks.push('No external hyperlinks detected in email body');
    }

    // ----------------------------------------------------
    // 3. URGENCY & COERCIVE SOCIAL ENGINEERING
    // ----------------------------------------------------
    const urgencyPatterns = [
      'immediate action required', 'account suspended', 'account will be terminated',
      'within 24 hours', 'within 48 hours', 'final notice', 'legal action',
      'arrest warrant', 'unauthorized transaction detected', 'suspicious login detected',
      'failure to respond will result', 'act now before your account is closed'
    ];
    const detectedUrgency = urgencyPatterns.filter(function (p) {
      return combinedContent.includes(p);
    });

    if (detectedUrgency.length >= 2) {
      score += 35;
      warnings.push('Artificial Urgency: Coercive threats detected ("' + detectedUrgency.slice(0, 2).join('", "') + '").');
    } else if (detectedUrgency.length === 1) {
      score += 18;
      warnings.push('Time-Sensitive Pressure: Contains urgent timeframe ("' + detectedUrgency[0] + '").');
    } else {
      cleanChecks.push('No artificial urgency or threatening deadlines detected');
    }

    // ----------------------------------------------------
    // 4. CREDENTIAL & OTP / 2FA HARVESTING
    // ----------------------------------------------------
    const credentialPatterns = [
      'verify your password', 'enter your password', 'provide your otp',
      'one-time password', 'verification code', '2fa code', 'social security number',
      'confirm your pin', 'atm pin', 'secret phrase', 'recovery words', 'send password'
    ];
    const detectedCreds = credentialPatterns.filter(function (p) {
      return combinedContent.includes(p);
    });

    if (detectedCreds.length > 0) {
      score += 45;
      warnings.push('Requests Confidential Credentials: Solicits "' + detectedCreds.join('", "') + '".');
    }

    // ----------------------------------------------------
    // 5. FINANCIAL / WIRE / PAYMENT COERCION
    // ----------------------------------------------------
    const financialPatterns = [
      'wire transfer', 'purchase gift cards', 'apple gift card', 'google play card',
      'crypto payment', 'bitcoin address', 'overdue invoice attached', 'payroll direct deposit update'
    ];
    const detectedFin = financialPatterns.filter(function (p) {
      return combinedContent.includes(p);
    });

    if (detectedFin.length > 0) {
      score += 30;
      warnings.push('Financial Coercion: Demands unusual payment or wire transfer ("' + detectedFin.join('", "') + '").');
    }

    // ----------------------------------------------------
    // 6. DANGEROUS ATTACHMENTS
    // ----------------------------------------------------
    if (combinedContent.includes('.exe') || combinedContent.includes('.scr') || combinedContent.includes('.vbs') || combinedContent.includes('enable macros')) {
      score += 40;
      warnings.push('Executable File Reference: Mentions dangerous executable attachments or macro execution.');
    }

    // Calculate Final Risk Level
    const finalScore = Math.min(Math.max(score, 0), 100);
    let riskLevel = 'SAFE-LOOKING';
    if (finalScore >= 60) {
      riskLevel = 'HIGH RISK';
      actions.push('DO NOT click any buttons, links, or attachments in this email.');
      actions.push('Never provide passwords, 2FA codes, or financial info.');
      actions.push('Report this email directly in Gmail (Click More 3-dots -> "Report phishing").');
    } else if (finalScore >= 25) {
      riskLevel = 'SUSPICIOUS';
      actions.push('Verify the sender directly using an official phone number or website you already know.');
      actions.push('Inspect any links carefully before clicking.');
      actions.push('Never share one-time passcodes or security answers over email.');
    } else {
      actions.push('Standard precaution: Ensure unexpected attachments are verified with the sender.');
      actions.push('Always confirm the sender domain matches the authentic organization.');
    }

    const explanation = riskLevel === 'HIGH RISK'
      ? 'This email exhibits multiple high-confidence indicators of deceptive credential harvesting, sender spoofing, or fraudulent coercion.'
      : riskLevel === 'SUSPICIOUS'
      ? 'This email contains suspicious patterns (such as unverified sender domain, urgent wording, or external links) that warrant caution.'
      : 'Structural and linguistic analysis identified standard domain hygiene and no prominent coercive phishing patterns.';

    return {
      score: finalScore,
      riskLevel: riskLevel,
      explanation: explanation,
      warnings: warnings,
      cleanChecks: cleanChecks,
      actions: actions,
    };
  }

  /**
   * Renders the PhishCode AI Alert Banner directly inside Gmail above the email body
   */
  function injectPhishCodeBanner(messageWrapper, bodyEl, result, emailData) {
    // Remove previous banner if any
    const existing = messageWrapper.querySelector('.phishcode-gmail-banner');
    if (existing) {
      existing.remove();
    }

    const banner = document.createElement('div');
    banner.className = 'phishcode-gmail-banner ' + (
      result.riskLevel === 'HIGH RISK'
        ? 'phishcode-banner-danger'
        : result.riskLevel === 'SUSPICIOUS'
        ? 'phishcode-banner-warning'
        : 'phishcode-banner-safe'
    );

    const badgeClass = result.riskLevel === 'HIGH RISK'
      ? 'phishcode-badge-danger'
      : result.riskLevel === 'SUSPICIOUS'
      ? 'phishcode-badge-warning'
      : 'phishcode-badge-safe';

    const meterColor = result.riskLevel === 'HIGH RISK'
      ? '#8A3028'
      : result.riskLevel === 'SUSPICIOUS'
      ? '#805B18'
      : '#315C3B';

    let html = '';

    // Header
    html += '<div class="phishcode-header">';
    html += '  <div class="phishcode-brand">';
    html += '    <div class="phishcode-logo-icon">🛡️</div>';
    html += '    <span class="phishcode-title">PhishCode AI Email Security</span>';
    html += '  </div>';
    html += '  <div class="phishcode-header-actions">';
    html += '    <span class="phishcode-status-badge ' + badgeClass + '">' + result.riskLevel + '</span>';
    html += '    <button class="phishcode-toggle-btn phishcode-btn-collapse" type="button">Details ▾</button>';
    html += '  </div>';
    html += '</div>';

    // Score Meter Row
    html += '<div class="phishcode-score-row">';
    html += '  <div class="phishcode-meter-bg">';
    html += '    <div class="phishcode-meter-bar" style="width: ' + Math.max(result.score, 5) + '%; background-color: ' + meterColor + ';"></div>';
    html += '  </div>';
    html += '  <span class="phishcode-score-text">' + result.score + ' / 100 Risk</span>';
    html += '</div>';

    // Summary Box
    html += '<div class="phishcode-summary">' + result.explanation + '</div>';

    // Collapsible Details Section
    html += '<div class="phishcode-details-container">';

    // Warnings List
    if (result.warnings.length > 0) {
      html += '<div class="phishcode-section-title phishcode-title-warning">Detected Warning Signs (' + result.warnings.length + ')</div>';
      html += '<div class="phishcode-list">';
      result.warnings.forEach(function (w) {
        html += '<div class="phishcode-item ' + (result.riskLevel === 'HIGH RISK' ? 'phishcode-item-danger' : 'phishcode-item-warning') + '">⚠️ ' + escapeHtml(w) + '</div>';
      });
      html += '</div>';
    }

    // Clean Checks List
    if (result.cleanChecks.length > 0) {
      html += '<div class="phishcode-section-title phishcode-title-clean">Clean Checks (' + result.cleanChecks.length + ')</div>';
      html += '<div class="phishcode-list">';
      result.cleanChecks.forEach(function (c) {
        html += '<div class="phishcode-item phishcode-item-clean">✓ ' + escapeHtml(c) + '</div>';
      });
      html += '</div>';
    }

    // Recommended Safety Actions
    html += '<div class="phishcode-section-title phishcode-title-action">Recommended Safety Actions</div>';
    html += '<div class="phishcode-list">';
    result.actions.forEach(function (a) {
      html += '<div class="phishcode-action-item">→ ' + escapeHtml(a) + '</div>';
    });
    html += '</div>';

    html += '</div>'; // end details container

    // Footer Disclaimer & Rescan
    html += '<div class="phishcode-footer">';
    html += '  <span>🔒 Analyzed 100% locally in browser • No email data transmitted</span>';
    html += '  <button class="phishcode-rescan-btn" type="button">Re-scan</button>';
    html += '</div>';

    banner.innerHTML = html;

    // Attach Collapsible & Rescan Event Handlers
    const detailsContainer = banner.querySelector('.phishcode-details-container');
    const toggleBtn = banner.querySelector('.phishcode-btn-collapse');
    let isCollapsed = false;

    // If safe, collapse details by default for cleanliness; if warning/danger, expand by default
    if (result.riskLevel === 'SAFE-LOOKING') {
      isCollapsed = true;
      detailsContainer.style.display = 'none';
      toggleBtn.textContent = 'Details ▾';
    } else {
      isCollapsed = false;
      detailsContainer.style.display = 'block';
      toggleBtn.textContent = 'Hide ▴';
    }

    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      isCollapsed = !isCollapsed;
      detailsContainer.style.display = isCollapsed ? 'none' : 'block';
      toggleBtn.textContent = isCollapsed ? 'Details ▾' : 'Hide ▴';
    });

    const rescanBtn = banner.querySelector('.phishcode-rescan-btn');
    rescanBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      messageWrapper.dataset.phishcodeScanned = 'false';
      scanOpenEmails();
    });

    // Insert banner above the message body in Gmail
    if (bodyEl.parentNode) {
      bodyEl.parentNode.insertBefore(banner, bodyEl);
    } else {
      messageWrapper.prepend(banner);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Start observing Gmail
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
