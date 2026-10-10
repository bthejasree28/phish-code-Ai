import React, { useState } from 'react';
import { ScanResult } from '../types';
import { StatusBadge } from './StatusBadge';
import { RiskMeter } from './RiskMeter';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  result: ScanResult;
  onRescan?: () => void;
  showDetailsToggle?: boolean;
}

export const ResultCard: React.FC<Props> = ({ result, showDetailsToggle = true }) => {
  const [copied, setCopied] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const handleCopySummary = () => {
    const summaryText = `[PhishCode AI Scan Report]
Type: ${result.type.toUpperCase()}
Subject: ${result.title}
Risk Level: ${result.riskLevel} (${result.riskScore}/100)
Assessment: ${result.explanation}
Warning Signs: ${result.warningSigns.join('; ') || 'None detected'}
Recommended Actions: ${result.recommendedActions.join('; ')}
Scanned on: ${new Date(result.timestamp).toLocaleString()}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBorderColor = () => {
    if (result.riskLevel === 'LOW RISK') return 'border-[#CAD8C5]';
    if (result.riskLevel === 'MEDIUM RISK') return 'border-[#E6C77A]'; // warm amber
    return 'border-[#E8B4B0]';
  };

  return (
    <div
      className={`bg-white rounded-xl border ${getBorderColor()} p-6 shadow-sm flex flex-col gap-6 transition-all`}
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E3DA]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#727873]">
              {result.type === 'url' ? 'URL Phishing Scan' : result.type === 'email' ? 'Email Threat Scan' : 'Scam Message Scan'}
            </span>
            <span className="text-xs text-[#727873]">•</span>
            <span className="text-xs text-[#727873]">
              {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[#292F2D] break-all leading-snug">
            {result.title}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge level={result.riskLevel} size="md" />
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#292F2D] hover:text-[#52796F] bg-[#F8F7F2] hover:bg-[#E5E3DA] border border-[#E5E3DA] px-3 py-1.5 rounded-lg transition-colors"
            title="Copy safe summary report"
          >
            {copied ? <Check size={14} className="text-[#315C3B]" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Share Report'}
          </button>
        </div>
      </div>

      {/* Risk meter indicator */}
      <div className="bg-[#F8F7F2] p-4 rounded-lg border border-[#E5E3DA]">
        <RiskMeter score={result.riskScore} level={result.riskLevel} />
      </div>

      {/* Summary explanation */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA]">
        <Info size={18} className="text-[#52796F] shrink-0 mt-0.5" />
        <p className="text-sm text-[#292F2D] leading-relaxed">
          {result.explanation}
        </p>
      </div>

      {/* Detected Warning Signs */}
      {result.warningSigns.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h4 className="text-sm font-semibold text-[#292F2D] flex items-center gap-2">
            <AlertTriangle
              size={16}
              className={result.riskLevel === 'HIGH RISK' ? 'text-[#8A3028]' : 'text-[#805B18]'}
            />
            Detected Warning Signs ({result.warningSigns.length})
          </h4>
          <div className="flex flex-col gap-2">
            {result.warningSigns.map((sign, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-sm border flex items-start gap-2.5 ${
                  result.riskLevel === 'HIGH RISK'
                    ? 'bg-[#F3D8D4] text-[#8A3028] border-[#E8B4B0]'
                    : 'bg-[#F5E6C8] text-[#805B18] border-[#E6C77A]'
                }`}
              >
                <span className="font-bold">•</span>
                <span className="leading-snug">{sign}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe characteristics passed */}
      {result.safeSigns.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-[#292F2D] flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#315C3B]" />
            Clean Checks ({result.safeSigns.length})
          </h4>
          <div className="flex flex-col gap-1.5">
            {result.safeSigns.map((sign, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg text-xs md:text-sm bg-[#DDEBDD] text-[#315C3B] border border-[#CAD8C5] flex items-center gap-2"
              >
                <Check size={14} className="shrink-0" />
                <span>{sign}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Safety Actions */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-sm font-semibold text-[#292F2D] flex items-center gap-2">
          <ShieldAlert size={16} className="text-[#52796F]" />
          Recommended Safety Next Steps
        </h4>
        <ul className="space-y-2">
          {result.recommendedActions.map((action, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-sm text-[#292F2D] bg-[#F8F7F2] p-2.5 rounded-lg border border-[#E5E3DA]"
            >
              <span className="w-5 h-5 rounded-full bg-[#CAD8C5] text-[#292F2D] font-semibold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="leading-snug">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Reasons breakdown */}
      {result.reasons && result.reasons.length > 0 && (
        <div className="text-xs text-[#727873] border-t border-[#E5E3DA] pt-3 flex flex-col gap-1">
          <span className="font-semibold text-[#292F2D]">Technical Findings:</span>
          {result.reasons.map((r, i) => (
            <p key={i}>• {r}</p>
          ))}
        </div>
      )}

      {/* Technical Details Toggle */}
      {showDetailsToggle && result.details && (
        <div>
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="inline-flex items-center gap-1.5 text-xs text-[#52796F] hover:text-[#354F52] font-medium"
          >
            {showTechnicalDetails ? (
              <>
                <ChevronUp size={14} /> Hide Technical Parser Breakdown
              </>
            ) : (
              <>
                <ChevronDown size={14} /> View Technical Parser Breakdown
              </>
            )}
          </button>
          {showTechnicalDetails && (
            <div className="mt-2.5 p-3 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA] text-xs font-mono text-[#292F2D] overflow-x-auto">
              <pre>{JSON.stringify(result.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Safety & Heuristic Disclaimer */}
      <div className="bg-[#F8F7F2] border border-[#E5E3DA] p-3 rounded-lg text-xs text-[#727873] leading-relaxed">
        <strong>Important Safety Notice:</strong> PhishCode AI performs advanced structural and heuristic pattern analysis. Heuristic scanning provides an essential early-warning line of defense but cannot guarantee a website is 100% safe. Always verify bank accounts and sensitive portals directly.
      </div>
    </div>
  );
};
