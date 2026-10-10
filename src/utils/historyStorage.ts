import { ScanResult, ScanStats } from '../types';

const STORAGE_KEY = 'phishcode_ai_scan_history_v1';

/**
 * Sanitize text to avoid saving passwords, OTPs, or credit cards
 */
function sanitizeForHistory(text: string): string {
  if (!text) return '';
  // Mask 16-digit card patterns
  let clean = text.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '•••• •••• •••• ••••');
  // Mask 6-digit OTP codes
  clean = clean.replace(/\b\d{6}\b/g, '•••-•••');
  // Truncate to reasonable preview length
  return clean.slice(0, 160);
}

export function getScanHistory(): ScanResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load scan history from localStorage:', err);
    return [];
  }
}

export function saveScanResult(result: ScanResult): ScanResult[] {
  try {
    const existing = getScanHistory();
    // Sanitize input preview to preserve privacy
    const sanitizedResult: ScanResult = {
      ...result,
      inputPreview: sanitizeForHistory(result.inputPreview),
    };

    // Prepend new scan, keep up to 50 recent items
    const updated = [sanitizedResult, ...existing.filter((item) => item.id !== result.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save scan to localStorage:', err);
    return getScanHistory();
  }
}

export function deleteScanResult(id: string): ScanResult[] {
  try {
    const existing = getScanHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete scan from localStorage:', err);
    return getScanHistory();
  }
}

export function clearScanHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear scan history:', err);
  }
}

export function getScanStats(history?: ScanResult[]): ScanStats {
  const list = history || getScanHistory();
  let safe = 0;
  let medium = 0;
  let high = 0;

  for (const item of list) {
    if (item.riskLevel === 'LOW RISK') {
      safe++;
    } else if (item.riskLevel === 'MEDIUM RISK') {
      medium++;
    } else if (item.riskLevel === 'HIGH RISK') {
      high++;
    }
  }

  return {
    total: list.length,
    safe,
    medium,
    high,
  };
}
