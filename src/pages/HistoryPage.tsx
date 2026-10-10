import React, { useState } from 'react';
import { ScanResult, ScanType, RiskLevel } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ResultCard } from '../components/ResultCard';
import {
  History,
  Trash2,
  Filter,
  Link2,
  Mail,
  MessageSquareWarning,
  Eye,
  AlertCircle,
  X,
  Clock,
  Download,
} from 'lucide-react';

interface Props {
  history: ScanResult[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onSelectTab: (tab: any) => void;
}

export const HistoryPage: React.FC<Props> = ({
  history,
  onClearHistory,
  onDeleteItem,
  onSelectTab,
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | ScanType>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');
  const [inspectingItem, setInspectingItem] = useState<ScanResult | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const filteredHistory = history.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (riskFilter !== 'all' && item.riskLevel !== riskFilter) return false;
    return true;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `phishcode-scan-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto w-full">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F8F7F2] text-[#52796F] border border-[#E5E3DA] flex items-center justify-center">
              <History size={18} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#292F2D] tracking-tight">
              Local Scan History
            </h1>
          </div>
          <p className="text-sm text-[#727873] mt-1">
            Privacy-safe session logs stored locally in your browser. Sensitive credentials and OTPs are stripped.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 text-xs text-[#292F2D] hover:text-[#52796F] bg-white border border-[#E5E3DA] px-3 py-2 rounded-xl transition-colors cursor-pointer"
                title="Export history as JSON"
              >
                <Download size={14} /> Export
              </button>
              <button
                onClick={() => setConfirmClearOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-[#8A3028] hover:bg-[#F3D8D4] bg-white border border-[#E8B4B0] px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 size={14} /> Clear History
              </button>
            </>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#E5E3DA] shadow-xl flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-[#F3D8D4] text-[#8A3028] flex items-center justify-center">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#292F2D]">Clear Scan History?</h3>
              <p className="text-xs text-[#727873] mt-1 leading-relaxed">
                This will delete all saved URL, email, and message scan records from this browser's local storage. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#727873] hover:text-[#292F2D] bg-[#F8F7F2] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setConfirmClearOpen(false);
                  setInspectingItem(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#8A3028] hover:bg-[#722620] rounded-lg"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E3DA] p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#727873] font-semibold mr-1 flex items-center gap-1">
              <Filter size={14} /> Type:
            </span>
            {(['all', 'url', 'email', 'message'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  typeFilter === t
                    ? 'bg-[#52796F] text-white'
                    : 'bg-[#F8F7F2] text-[#727873] hover:text-[#292F2D] border border-[#E5E3DA]'
                }`}
              >
                {t === 'all' ? 'All Types' : t === 'url' ? 'URLs' : t === 'email' ? 'Emails' : 'Messages'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#727873] font-semibold mr-1">Risk:</span>
            {(['all', 'LOW RISK', 'MEDIUM RISK', 'HIGH RISK'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  riskFilter === r
                    ? 'bg-[#52796F] text-white'
                    : 'bg-[#F8F7F2] text-[#727873] hover:text-[#292F2D] border border-[#E5E3DA]'
                }`}
              >
                {r === 'all' ? 'All Risks' : r === 'LOW RISK' ? 'Low' : r === 'MEDIUM RISK' ? 'Medium' : 'High'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History Items or Empty State */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E3DA] p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F8F7F2] border border-[#E5E3DA] text-[#727873] flex items-center justify-center">
            <Clock size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#292F2D]">
              {history.length === 0 ? 'No Scan History Found' : 'No Scans Match Current Filters'}
            </h3>
            <p className="text-xs sm:text-sm text-[#727873] mt-1 max-w-md">
              {history.length === 0
                ? 'Whenever you analyze a URL, email, or message, a privacy-sanitized report will appear here.'
                : 'Try clearing your type or risk filter to view other saved scan results.'}
            </p>
          </div>
          {history.length === 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => onSelectTab('url-scanner')}
                className="bg-[#52796F] text-white text-xs font-medium px-4 py-2.5 rounded-xl hover:bg-[#354F52]"
              >
                Scan a URL
              </button>
              <button
                onClick={() => onSelectTab('email-analyzer')}
                className="bg-[#F8F7F2] text-[#292F2D] border border-[#E5E3DA] text-xs font-medium px-4 py-2.5 rounded-xl hover:bg-[#CAD8C5]"
              >
                Analyze an Email
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-[#E5E3DA] hover:border-[#CAD8C5] p-4.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA] flex items-center justify-center shrink-0">
                  {item.type === 'url' ? (
                    <Link2 size={18} className="text-[#52796F]" />
                  ) : item.type === 'email' ? (
                    <Mail size={18} className="text-[#52796F]" />
                  ) : (
                    <MessageSquareWarning size={18} className="text-[#52796F]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold uppercase text-[#727873]">
                      {item.type}
                    </span>
                    <span className="text-xs text-[#727873]">•</span>
                    <span className="text-xs text-[#727873]">
                      {new Date(item.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#292F2D] truncate mt-0.5 max-w-xl">
                    {item.title}
                  </p>

                  <p className="text-xs text-[#727873] line-clamp-1 mt-0.5">
                    {item.explanation}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E3DA]">
                <div className="flex items-center gap-2">
                  <StatusBadge level={item.riskLevel} size="sm" />
                  <span className="text-xs font-bold text-[#292F2D] bg-[#F8F7F2] px-2 py-0.5 rounded border border-[#E5E3DA]">
                    {item.riskScore}/100
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setInspectingItem(item)}
                    className="p-1.5 rounded-lg text-[#727873] hover:text-[#52796F] hover:bg-[#F8F7F2] transition-colors cursor-pointer"
                    title="View complete report"
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-[#727873] hover:text-[#8A3028] hover:bg-[#F3D8D4] transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspecting Item Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F8F7F2] rounded-2xl max-w-3xl w-full border border-[#E5E3DA] shadow-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectingItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white text-[#727873] hover:text-[#292F2D] border border-[#E5E3DA] shadow-xs cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="pt-2">
              <ResultCard result={inspectingItem} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
