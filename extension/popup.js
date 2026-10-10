/**
 * PhishCode AI Chrome Extension Popup Logic (Manifest V3)
 * Supports:
 * 1. Web Scanner: Analyzes current active tab URL with client-side heuristics
 * 2. Gmail Shield: Shows status of in-Gmail phishing detection and quick launch
 */

document.addEventListener('DOMContentLoaded', function () {
  let activeTabUrl = '';
  const webAppBaseUrl = 'https://phishcode.ai';

  // Tabs
  const tabWebBtn = document.getElementById('tab-web-btn');
  const tabGmailBtn = document.getElementById('tab-gmail-btn');
  const panelWeb = document.getElementById('panel-web');
  const panelGmail = document.getElementById('panel-gmail');
  const openGmailBtn = document.getElementById('open-gmail-btn');

  // Web Scanner Elements
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

  // Tab switching
  if (tabWebBtn && tabGmailBtn) {
    tabWebBtn.addEventListener('click', function () {
      tabWebBtn.classList.add('active');
      tabGmailBtn.classList.remove('active');
      panelWeb.classList.remove('hidden');
      panelGmail.classList.add('hidden');
    });

    tabGmailBtn.addEventListener('click', function () {
      tabGmailBtn.classList.add('active');
      tabWebBtn.classList.remove('active');
      panelGmail.classList.remove('hidden');
      panelWeb.classList.add('hidden');
    });
  }

  if (openGmailBtn) {
    openGmailBtn.addEventListener('click', function () {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: 'https://mail.google.com/' });
      } else {
        window.open('https://mail.google.com/', '_blank');
      }
    });
  }

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
    // Standalone fallback
    initTab('https://paypal.com.verification-security-portal.xyz/login');
  }

  function initTab(url) {
    activeTabUrl = url;

    // If currently on Gmail, auto-highlight Gmail Shield tab
    if (url.includes('mail.google.com')) {
      if (tabGmailBtn && tabWebBtn) {
        tabGmailBtn.classList.add('active');
        tabWebBtn.classList.remove('active');
        panelGmail.classList.remove('hidden');
        panelWeb.classList.add('hidden');
      }
    }

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
    if (parsed.username || parsed.password) {
      score += 35;
      warnings.push('Userinfo (@) syntax detected in URL authority');
    }

    // 5. Suspicious TLD
    const parts = host.split('.');
    const tld = parts.length > 1 ? parts[parts.length - 1] : '';
    const badTlds = ['xyz', 'top', 'tk', 'zip', 'mov', 'cam', 'gq', 'cf', 'ml', 'ga', 'click', 'link', 'country'];
    if (badTlds.includes(tld)) {
      score += 28;
      warnings.push('High-risk Top-Level Domain (.' + tld + ')');
    } else if (tld) {
      cleanChecks.push('Standard Top-Level Domain (.' + tld + ')');
    }

    // 6. Excessive subdomains
    if (parts.length >= 4) {
      score += 20;
      warnings.push('Excessive subdomain depth (' + parts.length + ' domain labels)');
    }

    // 7. Hyphens in domain
    const hyphenCount = (host.match(/-/g) || []).length;
    if (hyphenCount >= 2) {
      score += 15;
      warnings.push('Multiple hyphens in domain name (common typosquatting technique)');
    }

    // 8. Brand keywords & Lookalike Typosquatting
    const brands = [
      { name: 'paypal', legit: 'paypal.com' },
      { name: 'google', legit: 'google.com' },
      { name: 'apple', legit: 'apple.com' },
      { name: 'microsoft', legit: 'microsoft.com' },
      { name: 'amazon', legit: 'amazon.com' },
      { name: 'netflix', legit: 'netflix.com' },
      { name: 'chase', legit: 'chase.com' },
      { name: 'wellsfargo', legit: 'wellsfargo.com' },
      { name: 'bankofamerica', legit: 'bankofamerica.com' },
    ];

    const leetMap = { '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's' };
    let normHost = host;
    for (const k in leetMap) {
      normHost = normHost.split(k).join(leetMap[k]);
    }
    const rootDomain = parts.length >= 2 ? parts.slice(-2).join('.') : host;

    let brandMismatch = false;
    for (let i = 0; i < brands.length; i++) {
      const b = brands[i];
      if (rootDomain === b.legit || host.endsWith('.' + b.legit)) {
        continue;
      }

      if (host.includes(b.name)) {
        brandMismatch = true;
        score += 50;
        warnings.push('Impersonates brand "' + b.name.toUpperCase() + '" on unauthorized domain (' + rootDomain + ')');
        break;
      }

      if (normHost.includes(b.name)) {
        brandMismatch = true;
        score += 55;
        warnings.push('Lookalike typosquatting detected: Spoofs "' + b.name.toUpperCase() + '" using character substitution');
        break;
      }
    }
    if (!brandMismatch) {
      cleanChecks.push('No known brand typosquatting detected');
    }

    // 9. Sensitive keywords
    const keywords = ['verify', 'login', 'secure', 'account', 'banking', 'update', 'signin', 'wallet', 'password', 'recover'];
    const foundKw = keywords.filter(function (k) {
      return path.includes(k) || host.includes(k);
    });
    if (foundKw.length >= 2) {
      score += 25;
      warnings.push('Contains urgent credential keywords: ' + foundKw.slice(0, 3).join(', '));
    } else if (foundKw.length === 1) {
      score += 10;
      warnings.push('Contains credential keyword: ' + foundKw[0]);
    }

    // Score categorization
    const finalScore = Math.min(Math.max(score, 0), 100);
    let riskLevel = 'LOW RISK';
    if (finalScore >= 55) {
      riskLevel = 'HIGH RISK';
    } else if (finalScore >= 25) {
      riskLevel = 'MEDIUM RISK';
    }

    // Actions
    if (riskLevel === 'HIGH RISK') {
      actions.push('DO NOT enter passwords, email addresses, or payment cards.');
      actions.push('Do not download or open any files from this site.');
      actions.push('Close this tab immediately.');
    } else if (riskLevel === 'MEDIUM RISK') {
      actions.push('Exercise caution: inspect address bar closely.');
      actions.push('Verify domain identity through official channels before entering data.');
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
