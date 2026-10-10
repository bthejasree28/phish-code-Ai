export type ScanType = 'url' | 'email' | 'message';

export type RiskLevel = 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';

export interface ScanResult {
  id: string;
  type: ScanType;
  title: string;
  inputPreview: string;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  warningSigns: string[];
  safeSigns: string[];
  reasons: string[];
  recommendedActions: string[];
  explanation: string;
  details?: Record<string, any>;
  timestamp: number;
}

export interface ScanStats {
  total: number;
  safe: number;
  medium: number;
  high: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  source?: 'gemini' | 'local_knowledgebase' | 'local_fallback';
  warning?: string;
}

export type TabType =
  | 'home'
  | 'dashboard'
  | 'url-scanner'
  | 'email-analyzer'
  | 'message-checker'
  | 'ai-assistant'
  | 'browser-protection'
  | 'chrome-extension'
  | 'security-tips'
  | 'history';
