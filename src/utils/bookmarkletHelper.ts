/**
 * PhishCode AI Bookmarklet Generator & Utilities
 */

/**
 * Generates a 100% syntactically valid, self-contained in-page JavaScript bookmarklet URL
 * beginning strictly with "javascript:".
 *
 * When clicked on ANY website, it scans the active page for phishing indicators
 * (insecure HTTP, raw IP hosts, suspicious TLDs, brand typosquatting, deceptive subdomains,
 * in-page password fields on unverified origins) and displays a floating security badge/modal
 * with an optional button to view the complete report in the PhishCode AI web app.
 */
export function generateBookmarkletCode(appOrigin: string): string {
  // Resolve base app origin without trailing slashes
  const origin = (appOrigin || (typeof window !== 'undefined' ? window.location.origin : ''))
    .replace(/\/+$/, '');

  // Directly construct the minified, verified JavaScript IIFE.
  // We avoid regex comment replacements that could inadvertently strip http:// strings.
  const script = `(function(){try{var loc=window.location;var rawUrl=loc.href;if(!rawUrl||rawUrl.indexOf('http')!==0){alert('PhishCode AI: Please run this scanner on an active web page (http or https).');return;}var appBase=${JSON.stringify(origin)};var oldModal=document.getElementById('phishcode-scanner-modal');if(oldModal){oldModal.remove();}var score=0;var warnings=[];var cleanChecks=[];var host=(loc.hostname||'').toLowerCase();var proto=(loc.protocol||'').toLowerCase();var path=((loc.pathname||'')+(loc.search||'')).toLowerCase();if(proto==='http:'){score+=25;warnings.push('Unencrypted connection (HTTP instead of HTTPS)');}else if(proto==='https:'){cleanChecks.push('Encrypted HTTPS connection active');}var isIp=/^(\\d{1,3}\\.){3}\\d{1,3}$/.test(host)||(host.charAt(0)==='['&&host.slice(-1)===']');if(isIp){score+=45;warnings.push('Host is a raw IP address, not a registered domain name');}if(loc.port&&loc.port!=='80'&&loc.port!=='443'){score+=18;warnings.push('Non-standard web port detected (:'+loc.port+')');}if(rawUrl.indexOf('@')!==-1){score+=40;warnings.push('Contains @ character, which can disguise true destination');}var tlds=['xyz','top','tk','zip','mov','cam','gq','cf','ml','ga','click','buzz','rest','shop','work','fit','surf','sbs','cfd','icu','monster'];var parts=host.split('.');var tld=parts[parts.length-1];if(tlds.indexOf(tld)!==-1){score+=25;warnings.push('High-risk Top-Level Domain (.'+tld+') associated with disposable phishing');}else if(['gov','edu','org'].indexOf(tld)!==-1){cleanChecks.push('Recognized institutional domain extension (.'+tld+')');}if(parts.length>=4&&!isIp){score+=15;warnings.push('Excessive subdomain depth ('+(parts.length-1)+' levels)');}var brands=[{n:'paypal',d:'paypal.com'},{n:'google',d:'google.com'},{n:'apple',d:'apple.com'},{n:'microsoft',d:'microsoft.com'},{n:'netflix',d:'netflix.com'},{n:'amazon',d:'amazon.com'},{n:'chase',d:'chase.com'},{n:'bankofamerica',d:'bankofamerica.com'},{n:'wellsfargo',d:'wellsfargo.com'},{n:'usps',d:'usps.com'},{n:'fedex',d:'fedex.com'},{n:'irs',d:'irs.gov'},{n:'coinbase',d:'coinbase.com'},{n:'binance',d:'binance.com'},{n:'facebook',d:'facebook.com'}];var brandSpoofed=false;for(var i=0;i<brands.length;i++){var b=brands[i];if(host.indexOf(b.n)!==-1){var root=parts.slice(-2).join('.');if(root!==b.d&&!host.endsWith('.'+b.d)){brandSpoofed=true;score+=45;warnings.push('Brand Impersonation: Mentions \"'+b.n.toUpperCase()+'\" on unverified domain ('+root+')');break;}}}if(!brandSpoofed){cleanChecks.push('No recognized brand impersonation detected in domain');}var kws=['login','signin','verify','verification','security','account-suspended','update-billing','password-reset','wallet','claim','bonus','2fa'];var kwMatches=[];for(var k=0;k<kws.length;k++){if(path.indexOf(kws[k])!==-1||host.indexOf(kws[k])!==-1){kwMatches.push(kws[k]);}}if(kwMatches.length>=2){score+=25;warnings.push('Contains urgent credential keywords: '+kwMatches.slice(0,3).join(', '));}else if(kwMatches.length===1){score+=10;warnings.push('Credential trigger word: \"'+kwMatches[0]+'\"');}try{var pwFields=document.querySelectorAll('input[type=\"password\"]');if(pwFields.length>0){if(proto==='http:'||score>=25){score+=30;warnings.push('Password input detected on insecure or suspicious page ('+pwFields.length+' field)');}else{cleanChecks.push('Password fields protected by HTTPS');}}}catch(domE){}if(host.indexOf('xn--')!==-1){score+=35;warnings.push('Punycode domain (xn--) detected — potential homograph attack');}var finalScore=Math.min(Math.max(score,0),100);var riskLevel='LOW RISK';var riskColor='#315C3B';var riskBg='#DDEBDD';var riskBorder='#CAD8C5';if(finalScore>=55){riskLevel='HIGH RISK';riskColor='#8A3028';riskBg='#F3D8D4';riskBorder='#E8B4B0';}else if(finalScore>=25){riskLevel='MEDIUM RISK';riskColor='#805B18';riskBg='#F5E6C8';riskBorder='#E6C77A';}var overlay=document.createElement('div');overlay.id='phishcode-scanner-modal';overlay.style.cssText='position:fixed;top:20px;right:20px;width:370px;max-width:calc(100vw - 32px);background:#FFFFFF;color:#292F2D;border:2px solid '+riskBorder+';border-radius:16px;box-shadow:0 16px 36px rgba(0,0,0,0.28);z-index:999999999;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;padding:18px;box-sizing:border-box;line-height:1.45;';var inner='<div style=\"display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;\"><div style=\"display:flex;align-items:center;gap:8px;\"><span style=\"display:inline-block;width:10px;height:10px;border-radius:50%;background:'+riskColor+';\"></span><strong style=\"font-size:14px;color:#292F2D;\">PhishCode AI Scanner</strong></div><button id=\"phishcode-close-x\" style=\"background:#F8F7F2;border:1px solid #E5E3DA;border-radius:6px;width:24px;height:24px;cursor:pointer;color:#727873;font-size:12px;font-weight:bold;display:flex;align-items:center;justify-content:center;\">✕</button></div>';inner+='<div style=\"background:'+riskBg+';color:'+riskColor+';border:1px solid '+riskBorder+';padding:8px 12px;border-radius:10px;font-size:13px;font-weight:bold;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;\"><span>'+riskLevel+'</span><span>'+finalScore+' / 100 Risk</span></div>';inner+='<div style=\"font-size:11px;color:#727873;margin-bottom:10px;word-break:break-all;\"><strong>Page:</strong> '+host+'</div>';if(warnings.length>0){inner+='<div style=\"margin-bottom:10px;\"><div style=\"font-size:11px;font-weight:bold;color:#805B18;text-transform:uppercase;margin-bottom:4px;\">Warnings ('+warnings.length+')</div>';for(var w=0;w<warnings.length;w++){inner+='<div style=\"font-size:11px;background:#F8F7F2;border:1px solid #E5E3DA;padding:5px 8px;border-radius:6px;margin-bottom:3px;color:#292F2D;\">• '+warnings[w]+'</div>';}inner+='</div>';}if(cleanChecks.length>0){inner+='<div style=\"margin-bottom:12px;\"><div style=\"font-size:11px;font-weight:bold;color:#315C3B;text-transform:uppercase;margin-bottom:4px;\">Clean Checks ('+cleanChecks.length+')</div>';for(var c=0;c<cleanChecks.length;c++){inner+='<div style=\"font-size:11px;background:#DDEBDD;color:#315C3B;border:1px solid #CAD8C5;padding:4px 8px;border-radius:6px;margin-bottom:3px;\">✓ '+cleanChecks[c]+'</div>';}inner+='</div>';}var reportUrl=appBase?(appBase+'/?url='+encodeURIComponent(rawUrl)+'&source=bookmarklet'):'';if(reportUrl){inner+='<button id=\"phishcode-open-dashboard\" style=\"width:100%;background:#52796F;color:#FFFFFF;border:none;padding:9px;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;\">Open Full Report in PhishCode AI →</button>';}overlay.innerHTML=inner;document.body.appendChild(overlay);document.getElementById('phishcode-close-x').onclick=function(){overlay.remove();};var dashBtn=document.getElementById('phishcode-open-dashboard');if(dashBtn&&reportUrl){dashBtn.onclick=function(){window.open(reportUrl,'_blank');overlay.remove();};}}catch(err){var fallbackUrl=${JSON.stringify(origin)}+'/?url='+encodeURIComponent(window.location.href)+'&source=bookmarklet';try{window.open(fallbackUrl,'_blank');}catch(openErr){alert('PhishCode AI Scanner Error: '+err.message);}}})();`;

  return 'javascript:' + script;
}

/**
 * Robust clipboard copy utility that works reliably in all contexts
 * (including iframe sandboxes without clipboard permission)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Modern navigator.clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Method 2: Hidden textarea with document.execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Validates a URL passed into the app (e.g. from the bookmarklet or query params)
 */
export function validateIncomingUrl(candidate: string | null): string | null {
  if (!candidate) return null;
  let decoded = candidate.trim();
  try {
    decoded = decodeURIComponent(decoded).trim();
  } catch {
    // Retain original string if double decode fails
  }
  if (!decoded) return null;

  // Basic sanity check to prevent javascript: or data: URIs
  if (/^javascript:/i.test(decoded) || /^data:/i.test(decoded) || /^vbscript:/i.test(decoded)) {
    return null;
  }

  // Prepend protocol if missing
  let normalized = decoded;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return normalized;
    }
    return null;
  } catch {
    return null;
  }
}
