/**
 * PhishCode AI Chrome Extension Popup Logic (Manifest V3)
 */

document.addEventListener('DOMContentLoaded', function () {
  let activeTabUrl = '';
  const webAppBaseUrl = 'https://phishcode.ai'; // Or user's hosted instance

  const targetUrlEl = document.getElementById('target-url');
  const idleStateEl = document.getElementById('idle-state');
  const loadingStateEl = document.getElementById('loading-state');
  const resultStateEl = document.getElementById('result-state');
  const unsupportedStateEl = document.getElementById('unsupported-state');

  const scanBtn = document.getElementById('scan-btn');
  const rescanBtn = document.getElementById('rescan-btn');
  const webAppBtn = document.getElementById('web-app-btn');

  const riskBadgeEl = document.getElementById('risk-badge');
  const riskLevelTextEl = document.getElementById('risk-level-text');
  const riskScoreTextEl = document.getElementById('risk-score-text');
  const meterFillEl = document.getElementById('meter-fill');
  const explanationBoxEl = document.getElementById('explanation-box');

  const warningsContainerEl = document.getElementById('warnings-container');
  const warningsListEl = document.getElementById('warnings-list');
  const cleanContainerEl = document.getElementById('clean-container');
  const cleanListEl = document.getElementById('clean-list');
  const actionsListEl = document.getElementById('actions-list');

  // Query active tab using Manifest V3 activeTab permission
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs[0] && tabs[0].url) {
        initTab(tabs[0].url);
      } else {
        showUnsupported();
      }
    });
  } else {
    // Development / standalone preview fallback
    initTab('https://paypal.com.verification-security-portal.xyz/login');
  }

  function initTab(url) {
    activeTabUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showUnsupported();
      return;
    }

    try {
      const parsed = new URL(url);
      targetUrlEl.textContent = parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
      idleStateEl.classList.remove('hidden');
    } catch {
      targetUrlEl.textContent = url.slice(0, 50);
      idleStateEl.classList.remove('hidden');
    }
  }

  function showUnsupported() {
    targetUrlEl.textContent = 'Non-web page (System Tab)';
    idleStateEl.classList.add('hidden');
    loadingStateEl.classList.add('hidden');
    resultStateEl.classList.add('hidden');
    unsupportedStateEl.classList.remove('hidden');
  }

  // Scan Button Handler
  scanBtn.addEventListener('click', function () {
    executeAnalysis(activeTabUrl);
  });

  rescanBtn.addEventListener('click', function () {
    executeAnalysis(activeTabUrl);
  });

  if (webAppBtn) {
    webAppBtn.addEventListener('click', function () {
      const target = webAppBaseUrl + '/?url=' + encodeURIComponent(activeTabUrl);
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: target });
      } else {
        window.open(target, '_blank');
      }
    });
  }

  function executeAnalysis(urlToAnalyze) {
    idleStateEl.classList.add('hidden');
    resultStateEl.classList.add('hidden');
    loadingStateEl.classList.remove('hidden');

    // Simulate short visual scan delay for smooth user experience
    setTimeout(function () {
      const scanResult = analyzeUrlHeuristics(urlToAnalyze);
      renderResults(scanResult);
      loadingStateEl.classList.add('hidden');
      resultStateEl.classList.remove('hidden');
    }, 450);
  }

  // Pure Client-Side Heuristic Engine for Manifest V3
  function analyzeUrlHeuristics(rawUrl) {
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch (e) {
      return {
        score: 75,
        riskLevel: 'HIGH RISK',
        explanation: 'Malformed address syntax detected. The URL could not be safely parsed.',
        warnings: ['Malformed URL structure'],
        cleanChecks: [],
        actions: ['Do not enter personal credentials or passwords.'],
      };
    }

    let score = 0;
    const warnings = [];
    const cleanChecks = [];
    const actions = [];

    const host = (parsed.hostname || '').toLowerCase();
    const proto = (parsed.protocol || '').toLowerCase();
    const path = ((parsed.pathname || '') + (parsed.search || '')).toLowerCase();

    // 1. Protocol
    if (proto === 'http:') {
      score += 25;
      warnings.push('Unencrypted connection (HTTP instead of HTTPS)');
    } else if (proto === 'https:') {
      cleanChecks.push('Encrypted HTTPS connection active');
    }

    // 2. IP as host
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || (host.startsWith('[') && host.endsWith(']'));
    if (isIp) {
      score += 45;
      warnings.push('Raw IP address host instead of registered domain name');
    }

    // 3. Non-standard port
    if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
      score += 18;
      warnings.push('Non-standard web port (:' + parsed.port + ')');
    }

    // 4. Userinfo (@ character in URL)
    if (rawUrl.indexOf('@') !== -1) {
      score += 40;
      warnings.push('Contains "@" character, which can deceive browser destination');
    }

    // 5. Suspicious TLDs
    const tlds = ['xyz', 'top', 'tk', 'zip', 'mov', 'cam', 'gq', 'cf', 'ml', 'ga', 'click', 'buzz', 'rest', 'shop', 'work', 'fit', 'surf', 'sbs', 'cfd', 'icu', 'monster'];
    const parts = host.split('.');
    const tld = parts[parts.length - 1];
    if (tlds.indexOf(tld) !== -1) {
      score += 25;
      warnings.push('High-risk Top-Level Domain (.' + tld + ') linked to disposable phishing');
    } else if (['gov', 'edu', 'org'].indexOf(tld) !== -1) {
      cleanChecks.push('Recognized institutional domain extension (.' + tld + ')');
    }

    // 6. Subdomain nesting
    if (parts.length >= 4 && !isIp) {
      score += 15;
      warnings.push('Excessive subdomain depth (' + (parts.length - 1) + ' levels)');
    }

    // 7. Brand Impersonation / Typosquatting
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

    let brandSpoofed = false;
    for (let i = 0; i < brands.length; i++) {
      const b = brands[i];
      if (host.indexOf(b.name) !== -1) {
        const rootDomain = parts.slice(-2).join('.');
        if (rootDomain !== b.legitDomain && !host.endsWith('.' + b.legitDomain)) {
          brandSpoofed = true;
          score += 45;
          warnings.push('Brand Impersonation: Mentions "' + b.name.toUpperCase() + '" on unverified domain (' + rootDomain + ')');
          break;
        }
      }
    }
    if (!brandSpoofed) {
      cleanChecks.push('No recognized brand impersonation detected in domain');
    }

    // 8. Suspicious keywords in URL
    const kws = ['login', 'signin', 'verify', 'verification', 'security', 'account-suspended', 'update-billing', 'password-reset', 'wallet', 'claim', 'bonus', '2fa'];
    const kwMatches = [];
    for (let k = 0; k < kws.length; k++) {
      if (path.indexOf(kws[k]) !== -1 || host.indexOf(kws[k]) !== -1) {
        kwMatches.push(kws[k]);
      }
    }
    if (kwMatches.length >= 2) {
      score += 25;
      warnings.push('Contains urgent credential keywords: ' + kwMatches.slice(0, 3).join(', '));
    } else if (kwMatches.length === 1) {
      score += 10;
      warnings.push('Credential trigger word detected: "' + kwMatches[0] + '"');
    }

    // 9. Punycode
    if (host.indexOf('xn--') !== -1) {
      score += 35;
      warnings.push('Punycode domain (xn--) detected — potential character spoofing');
    }

    const finalScore = Math.min(Math.max(score, 0), 100);
    let riskLevel = 'LOW RISK';
    if (finalScore >= 55) {
      riskLevel = 'HIGH RISK';
      actions.push('DO NOT enter usernames, passwords, or credit card details.');
      actions.push('Leave this webpage immediately if it requested personal data.');
    } else if (finalScore >= 25) {
      riskLevel = 'MEDIUM RISK';
      actions.push('Verify the address in your browser address bar carefully.');
      actions.push('Navigate to the company’s official site directly instead.');
    } else {
      actions.push('No obvious phishing signatures found in the URL structure.');
      actions.push('Standard advice: Ensure the address matches authentic service.');
    }

    const explanation = riskLevel === 'HIGH RISK'
      ? 'This website exhibits critical signatures of deceptive phishing or untrusted infrastructure (Score: ' + finalScore + '/100).'
      : riskLevel === 'MEDIUM RISK'
      ? 'This website shows suspicious or unverified patterns requiring caution before proceeding (Score: ' + finalScore + '/100).'
      : 'Structural analysis identified standard domain hygiene and no immediate deceptive indicators (Score: ' + finalScore + '/100).';

    return {
      score: finalScore,
      riskLevel: riskLevel,
      explanation: explanation,
      warnings: warnings,
      cleanChecks: cleanChecks,
      actions: actions,
    };
  }

  function renderResults(res) {
    riskBadgeEl.className = 'risk-badge';
    meterFillEl.style.width = Math.max(res.score, 4) + '%';

    if (res.riskLevel === 'HIGH RISK') {
      riskBadgeEl.classList.add('risk-danger');
      meterFillEl.style.backgroundColor = '#8A3028';
    } else if (res.riskLevel === 'MEDIUM RISK') {
      riskBadgeEl.classList.add('risk-warning');
      meterFillEl.style.backgroundColor = '#805B18';
    } else {
      riskBadgeEl.classList.add('risk-safe');
      meterFillEl.style.backgroundColor = '#315C3B';
    }

    riskLevelTextEl.textContent = res.riskLevel;
    riskScoreTextEl.textContent = res.score + ' / 100 Risk';
    explanationBoxEl.textContent = res.explanation;

    // Render Warnings
    warningsListEl.innerHTML = '';
    if (res.warnings && res.warnings.length > 0) {
      warningsContainerEl.classList.remove('hidden');
      res.warnings.forEach(function (w) {
        const item = document.createElement('div');
        item.className = 'finding-item ' + (res.riskLevel === 'HIGH RISK' ? 'finding-danger' : 'finding-warning');
        item.textContent = '• ' + w;
        warningsListEl.appendChild(item);
      });
    } else {
      warningsContainerEl.classList.add('hidden');
    }

    // Render Clean Checks
    cleanListEl.innerHTML = '';
    if (res.cleanChecks && res.cleanChecks.length > 0) {
      cleanContainerEl.classList.remove('hidden');
      res.cleanChecks.forEach(function (c) {
        const item = document.createElement('div');
        item.className = 'finding-item finding-clean';
        item.textContent = '✓ ' + c;
        cleanListEl.appendChild(item);
      });
    } else {
      cleanContainerEl.classList.add('hidden');
    }

    // Render Actions
    actionsListEl.innerHTML = '';
    if (res.actions) {
      res.actions.forEach(function (a) {
        const item = document.createElement('div');
        item.className = 'action-item';
        item.textContent = '→ ' + a;
        actionsListEl.appendChild(item);
      });
    }
  }
});
