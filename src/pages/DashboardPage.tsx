import React from 'react';
import { ScanResult, ScanStats, TabType } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Scan,
  Link2,
  Mail,
  MessageSquareWarning,
  Bot,
  ArrowRight,
  Shield,
  Lightbulb,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface Props {
  stats: ScanStats;
  history: ScanResult[];
  onSelectTab: (tab: TabType) => void;
  onViewResult: (result: ScanResult) => void;
}

export const DashboardPage: React.FC<Props> = ({
  stats,
  history,
  onSelectTab,
  onViewResult,
}) => {
  const recentScans = history.slice(0, 5);

  const practicalRecommendations = [
    {
      title: 'Never Share One-Time Passcodes (OTPs)',
      desc: 'Legitimate banks, government portals, and delivery drivers will never ask you to read out or forward a 6-digit SMS verification code.',
      category: 'Credential Safety',
    },
    {
      title: 'Inspect the Root Domain, Not Just the Beginning',
      desc: 'Phishers craft addresses like "paypal.com.verify-billing.xyz". Always look at the last two segments before the first slash ("verify-billing.xyz").',
      category: 'URL Inspection',
    },
    {
      title: 'Beware of Manufactured Urgency',
      desc: 'Emails threatening "immediate account termination within 24 hours" are designed to short-circuit critical thinking. Verify via official app.',
      category: 'Social Engineering',
    },
    {
      title: 'Enable Passkeys or Authenticator Apps',
      desc: 'Hardware keys and authenticator apps (e.g., Google Authenticator) are immune to SMS interception and credential relay attacks.',
      category: 'Account Defense',
    },
  ];

  return (
    <div className="flex flex-col gap-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#292F2D] tracking-tight">
            Security Dashboard
          </h1>
          <p className="text-sm text-[#727873] mt-1">
            Real-time status based exclusively on your application scan activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('url-scanner')}
            className="inline-flex items-center gap-2 bg-[#52796F] hover:bg-[#354F52] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <Scan size={16} /> New Scan
          </button>
        </div>
      </div>

      {/* Actual Application Scan Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E3DA] flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#727873]">
              Total Scans
            </p>
            <p className="text-3xl font-extrabold text-[#292F2D] mt-1">
              {stats.total}
            </p>
            <p className="text-[11px] text-[#727873] mt-1">Stored locally in session</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA] text-[#52796F] flex items-center justify-center">
            <Scan size={24} />
          </div>
        </div>

        {/* Safe Results */}
        <div className="bg-white p-5 rounded-xl border border-[#CAD8C5] flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#315C3B]">
              Safe Results
            </p>
            <p className="text-3xl font-extrabold text-[#315C3B] mt-1">
              {stats.safe}
            </p>
            <p className="text-[11px] text-[#315C3B] mt-1">Low risk indicators</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#DDEBDD] text-[#315C3B] flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>

        {/* Suspicious / Warning Results (Warm Amber) */}
        <div className="bg-white p-5 rounded-xl border border-[#E6C77A] flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#805B18]">
              Suspicious
            </p>
            <p className="text-3xl font-extrabold text-[#805B18] mt-1">
              {stats.medium}
            </p>
            <p className="text-[11px] text-[#805B18] mt-1">Medium risk warnings</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F5E6C8] text-[#805B18] border border-[#E6C77A] flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* High Risk Results */}
        <div className="bg-white p-5 rounded-xl border border-[#E8B4B0] flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8A3028]">
              High Risk
            </p>
            <p className="text-3xl font-extrabold text-[#8A3028] mt-1">
              {stats.high}
            </p>
            <p className="text-[11px] text-[#8A3028] mt-1">Potential threats flagged</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F3D8D4] text-[#8A3028] flex items-center justify-center">
            <AlertOctagon size={24} />
          </div>
        </div>
      </div>

      {/* Quick Launch Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onSelectTab('url-scanner')}
          className="bg-white hover:bg-[#F8F7F2] p-5 rounded-xl border border-[#E5E3DA] text-left transition-colors flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#F8F7F2] text-[#52796F] flex items-center justify-center border border-[#E5E3DA]">
              <Link2 size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#292F2D]">Scan a Website URL</p>
              <p className="text-xs text-[#727873]">Verify domain authenticity & structure</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#727873] group-hover:text-[#52796F] transition-colors" />
        </button>

        <button
          onClick={() => onSelectTab('email-analyzer')}
          className="bg-white hover:bg-[#F8F7F2] p-5 rounded-xl border border-[#E5E3DA] text-left transition-colors flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#F8F7F2] text-[#52796F] flex items-center justify-center border border-[#E5E3DA]">
              <Mail size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#292F2D]">Detect Phishing Email</p>
              <p className="text-xs text-[#727873]">Analyze urgent wording & credential traps</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#727873] group-hover:text-[#52796F] transition-colors" />
        </button>

        <button
          onClick={() => onSelectTab('message-checker')}
          className="bg-white hover:bg-[#F8F7F2] p-5 rounded-xl border border-[#E5E3DA] text-left transition-colors flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#F8F7F2] text-[#52796F] flex items-center justify-center border border-[#E5E3DA]">
              <MessageSquareWarning size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#292F2D]">Check Scam SMS / Message</p>
              <p className="text-xs text-[#727873]">Detect package smishing & fake prizes</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#727873] group-hover:text-[#52796F] transition-colors" />
        </button>
      </div>

      {/* Main Content Split: Recent Scans + Practical Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Scans */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E3DA] p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DA]">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#52796F]" />
              <h2 className="font-bold text-base text-[#292F2D]">Recent Scan Activity</h2>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => onSelectTab('history')}
                className="text-xs font-semibold text-[#52796F] hover:text-[#354F52] flex items-center gap-1"
              >
                View all ({history.length}) <ArrowRight size={12} />
              </button>
            )}
          </div>

          {recentScans.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F8F7F2] border border-[#E5E3DA] text-[#727873] flex items-center justify-center">
                <Scan size={22} />
              </div>
              <h3 className="font-semibold text-sm text-[#292F2D]">No Scans Performed Yet</h3>
              <p className="text-xs text-[#727873] max-w-sm">
                Check a link, email, or message above to begin building your local session activity.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onSelectTab('url-scanner')}
                  className="bg-[#52796F] text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-[#354F52]"
                >
                  Test URL Scanner
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E3DA]">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => onViewResult(scan)}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#F8F7F2] px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA] flex items-center justify-center shrink-0">
                      {scan.type === 'url' ? (
                        <Link2 size={16} className="text-[#52796F]" />
                      ) : scan.type === 'email' ? (
                        <Mail size={16} className="text-[#52796F]" />
                      ) : (
                        <MessageSquareWarning size={16} className="text-[#52796F]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#292F2D] truncate">
                        {scan.title}
                      </p>
                      <p className="text-xs text-[#727873]">
                        {new Date(scan.timestamp).toLocaleDateString()} • Score: {scan.riskScore}/100
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge level={scan.riskLevel} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Practical Security Recommendations */}
        <div className="bg-white rounded-xl border border-[#E5E3DA] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E3DA]">
            <Lightbulb size={18} className="text-[#805B18]" />
            <h2 className="font-bold text-base text-[#292F2D]">Practical Security Advice</h2>
          </div>

          <div className="flex flex-col gap-3.5">
            {practicalRecommendations.map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA] flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase text-[#52796F] tracking-wider">
                    {tip.category}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#292F2D] leading-snug">
                  {tip.title}
                </h4>
                <p className="text-xs text-[#727873] leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelectTab('security-tips')}
            className="w-full text-center py-2.5 text-xs font-semibold text-[#52796F] hover:text-[#354F52] bg-[#F8F7F2] rounded-lg border border-[#E5E3DA] transition-colors"
          >
            Read All Security Awareness Guides →
          </button>
        </div>
      </div>
    </div>
  );
};
