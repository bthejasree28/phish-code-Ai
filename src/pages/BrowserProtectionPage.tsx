import React, { useState, useEffect, useRef } from 'react';
import { generateBookmarkletCode, copyToClipboard } from '../utils/bookmarkletHelper';
import {
  Bookmark,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  Laptop,
  Chrome,
  Compass,
  ArrowRight,
  Sparkles,
  Lock,
  EyeOff,
  AlertOctagon,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface Props {
  onTestConnection: (testUrl: string) => void;
}

export const BrowserProtectionPage: React.FC<Props> = ({ onTestConnection }) => {
  const [copyFeedback, setCopyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeBrowserTab, setActiveBrowserTab] = useState<'chrome' | 'edge' | 'firefox'>('chrome');
  const [testUrlInput, setTestUrlInput] = useState('https://paypal.com.verification-security-portal.xyz/login');
  const [originUrl, setOriginUrl] = useState(() => (typeof window !== 'undefined' ? window.location.origin : ''));
  const [isApiTesting, setIsApiTesting] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<any | null>(null);
  const [apiTestError, setApiTestError] = useState<string | null>(null);
  const [inPagePreviewOpen, setInPagePreviewOpen] = useState(false);

  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setOriginUrl(window.location.origin);
    }
  }, []);

  const bookmarkletCode = generateBookmarkletCode(originUrl);

  const handleCopyCode = async () => {
    const success = await copyToClipboard(bookmarkletCode);
    if (success) {
      setCopyFeedback({
        type: 'success',
        message: 'Bookmarklet code copied successfully to clipboard! You can now paste it into your browser bookmark URL field.',
      });
    } else {
      setCopyFeedback({
        type: 'error',
        message: 'Clipboard permission was blocked by the browser. Please click "Select All" in the box below and press Ctrl+C (Cmd+C).',
      });
      if (codeTextareaRef.current) {
        codeTextareaRef.current.focus();
        codeTextareaRef.current.select();
      }
    }
    setTimeout(() => {
      setCopyFeedback(null);
    }, 4500);
  };

  const handleSelectAllCode = () => {
    if (codeTextareaRef.current) {
      codeTextareaRef.current.focus();
      codeTextareaRef.current.select();
    }
  };

  // Run backend-verified scan via /api/scan-url
  const handleRunBackendScanTest = async () => {
    setApiTestError(null);
    setApiTestResult(null);
    setIsApiTesting(true);

    try {
      const response = await fetch('/api/scan-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrlInput }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server rejected the test URL.');
      }

      setApiTestResult(data.result);
    } catch (err: any) {
      setApiTestError(err.message || 'Failed to connect to backend scan API.');
    } finally {
      setIsApiTesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 py-6 max-w-4xl mx-auto w-full">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#DDEBDD] text-[#315C3B] flex items-center justify-center">
            <Bookmark size={18} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#292F2D] tracking-tight">
            Browser Protection via Bookmarklet
          </h1>
        </div>
        <p className="text-sm text-[#727873] mt-1.5 max-w-2xl">
          Analyze any website directly in your browser without installing heavy extensions or granting broad background permissions.
        </p>
      </div>

      {/* Critical URL Warning Alert */}
      <div className="bg-[#F5E6C8] border-2 border-[#E6C77A] rounded-2xl p-5 text-[#805B18] shadow-xs flex items-start gap-3.5">
        <AlertTriangle size={22} className="shrink-0 mt-0.5 text-[#805B18]" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <p className="font-bold text-sm text-[#805B18]">
            Important Installation Rule: Use JavaScript, Not a Website URL
          </p>
          <p className="mt-1">
            A bookmarklet is a self-executing tool that <strong>MUST start with <code className="bg-white/70 px-1.5 py-0.5 rounded font-mono font-bold text-[#805B18]">javascript:</code></strong>.
            <br />
            <strong>Do NOT paste</strong> an ordinary website link, the Google AI Studio applet URL, or a YouTube link into the bookmark's URL field! You must paste the full JavaScript code generated below.
          </p>
        </div>
      </div>

      {/* Main Bookmarklet Action Card */}
      <div className="bg-white rounded-2xl border border-[#E5E3DA] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E3DA]">
          <div>
            <h2 className="text-lg font-bold text-[#292F2D]">1. Get the Bookmarklet Code</h2>
            <p className="text-xs sm:text-sm text-[#727873] mt-0.5">
              Click the button below to copy the verified JavaScript scanner code.
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center justify-center gap-2 bg-[#52796F] hover:bg-[#354F52] text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer shrink-0"
          >
            {copyFeedback?.type === 'success' ? (
              <Check size={18} className="text-[#DDEBDD]" />
            ) : (
              <Copy size={18} />
            )}
            <span>Copy Bookmarklet Code</span>
          </button>
        </div>

        {/* Copy Status Feedback Alert */}
        {copyFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 border transition-all ${
              copyFeedback.type === 'success'
                ? 'bg-[#DDEBDD] border-[#CAD8C5] text-[#315C3B]'
                : 'bg-[#F3D8D4] border-[#E8B4B0] text-[#8A3028]'
            }`}
          >
            {copyFeedback.type === 'success' ? (
              <Check size={18} className="shrink-0" />
            ) : (
              <AlertOctagon size={18} className="shrink-0" />
            )}
            <span className="font-medium">{copyFeedback.message}</span>
          </div>
        )}

        {/* Draggable Button Display */}
        <div className="bg-[#F8F7F2] border border-dashed border-[#CAD8C5] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#727873]">
            Option A: Drag this button directly into your browser's Bookmarks toolbar:
          </p>
          <a
            href={bookmarkletCode}
            draggable="true"
            onClick={(e) => {
              // Instead of blocking or showing an alert, trigger a live preview right on this page!
              e.preventDefault();
              setInPagePreviewOpen(true);
            }}
            className="inline-flex items-center gap-2.5 bg-[#52796F] hover:bg-[#354F52] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md cursor-grab active:cursor-grabbing border-2 border-white transition-all select-none"
            title="Drag to your Bookmarks Bar! (Or click to test live preview)"
          >
            <Bookmark size={18} />
            <span>🔒 PhishCode AI Scanner</span>
          </a>
          <p className="text-[11px] text-[#727873]">
            Tip: Press <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E5E3DA] text-[#292F2D]">Ctrl + Shift + B</kbd> (Windows) or <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E5E3DA] text-[#292F2D]">Cmd + Shift + B</kbd> (Mac) to show your browser's Bookmarks Bar.
          </p>
        </div>

        {/* Code Preview Box */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#727873]">
              Generated JavaScript Code (Starts with <span className="font-mono text-[#52796F]">javascript:</span>)
            </label>
            <button
              onClick={handleSelectAllCode}
              className="text-xs text-[#52796F] hover:text-[#354F52] font-medium underline cursor-pointer"
            >
              Select All Code
            </button>
          </div>
          <textarea
            ref={codeTextareaRef}
            readOnly
            rows={4}
            value={bookmarkletCode}
            className="bg-[#F8F7F2] border border-[#E5E3DA] rounded-xl p-3 font-mono text-xs text-[#292F2D] resize-none focus:outline-none focus:border-[#52796F] select-all leading-relaxed"
          />
        </div>
      </div>

      {/* Dedicated Step-by-Step Manual Installation Guide */}
      <div className="bg-white rounded-2xl border border-[#E5E3DA] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-[#292F2D]">
            2. Simple Manual Installation (Recommended for Chrome & Edge)
          </h2>
          <p className="text-xs sm:text-sm text-[#727873] mt-0.5">
            Follow these 6 simple steps to add the scanner bookmark in Google Chrome or Microsoft Edge.
          </p>
        </div>

        {/* Browser Selector Tabs */}
        <div className="flex border-b border-[#E5E3DA] gap-2">
          <button
            onClick={() => setActiveBrowserTab('chrome')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeBrowserTab === 'chrome'
                ? 'border-[#52796F] text-[#52796F]'
                : 'border-transparent text-[#727873] hover:text-[#292F2D]'
            }`}
          >
            Google Chrome Instructions
          </button>
          <button
            onClick={() => setActiveBrowserTab('edge')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeBrowserTab === 'edge'
                ? 'border-[#52796F] text-[#52796F]'
                : 'border-transparent text-[#727873] hover:text-[#292F2D]'
            }`}
          >
            Microsoft Edge Instructions
          </button>
          <button
            onClick={() => setActiveBrowserTab('firefox')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeBrowserTab === 'firefox'
                ? 'border-[#52796F] text-[#52796F]'
                : 'border-transparent text-[#727873] hover:text-[#292F2D]'
            }`}
          >
            Firefox & Safari
          </button>
        </div>

        {/* Step list strictly matching requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA]">
              <span className="w-6 h-6 rounded-full bg-[#CAD8C5] text-[#292F2D] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p className="text-xs sm:text-sm text-[#292F2D] leading-relaxed">
                Click the <span className="font-semibold text-[#52796F]">"Copy Bookmarklet Code"</span> button above to copy the JavaScript to your clipboard.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA]">
              <span className="w-6 h-6 rounded-full bg-[#CAD8C5] text-[#292F2D] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p className="text-xs sm:text-sm text-[#292F2D] leading-relaxed">
                In Chrome, press <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E5E3DA] font-semibold text-[#292F2D]">Ctrl + D</kbd> (or <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E5E3DA] font-semibold text-[#292F2D]">Cmd + D</kbd> on Mac) to open the bookmark dialog on any tab.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA]">
              <span className="w-6 h-6 rounded-full bg-[#CAD8C5] text-[#292F2D] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <p className="text-xs sm:text-sm text-[#292F2D] leading-relaxed">
                Click <span className="font-semibold">"Edit..."</span> or <span className="font-semibold">"More..."</span> in the bookmark dialog to reveal the Name and URL fields.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA]">
              <span className="w-6 h-6 rounded-full bg-[#CAD8C5] text-[#292F2D] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                4
              </span>
              <p className="text-xs sm:text-sm text-[#292F2D] leading-relaxed">
                Set the <span className="font-semibold">Name</span> field to: <span className="font-semibold text-[#52796F]">"PhishCode AI Scanner"</span>.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5E6C8] border border-[#E6C77A] text-[#805B18]">
              <span className="w-6 h-6 rounded-full bg-[#E6C77A] text-[#805B18] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                5
              </span>
              <p className="text-xs sm:text-sm leading-relaxed">
                In the <span className="font-bold">URL</span> field, <strong>delete the existing website address completely</strong>, and <strong>paste</strong> the copied code starting with <code className="font-bold">javascript:</code>. Click <span className="font-bold">Save</span>.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#DDEBDD] border border-[#CAD8C5] text-[#315C3B]">
              <span className="w-6 h-6 rounded-full bg-[#52796F] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                6
              </span>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong>You're protected!</strong> Visit any website (shopping, banking, or email link) and click <span className="font-semibold">"PhishCode AI Scanner"</span> in your bookmarks bar to analyze it instantly!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backend Scan Test & Simulator */}
      <div className="bg-white rounded-2xl border border-[#E5E3DA] p-6 sm:p-8 shadow-xs flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#292F2D]">3. Test Browser Connection & Backend API</h2>
          <p className="text-xs sm:text-sm text-[#727873] mt-0.5">
            Test the scanner against our server API (<code className="bg-[#F8F7F2] px-1 rounded font-mono">POST /api/scan-url</code>) or simulate the in-page scanner modal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={testUrlInput}
            onChange={(e) => setTestUrlInput(e.target.value)}
            className="flex-1 bg-[#F8F7F2] border border-[#E5E3DA] focus:border-[#52796F] focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#292F2D]"
            placeholder="Enter test URL..."
          />
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <button
              onClick={handleRunBackendScanTest}
              disabled={isApiTesting}
              className="bg-[#52796F] hover:bg-[#354F52] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Verify with backend scan API"
            >
              <ShieldCheck size={16} />
              <span>{isApiTesting ? 'Scanning...' : 'Test Backend API'}</span>
            </button>
            <button
              onClick={() => setInPagePreviewOpen(true)}
              className="bg-[#F8F7F2] hover:bg-[#E5E3DA] text-[#292F2D] border border-[#E5E3DA] px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Preview the exact floating badge that appears when clicked"
            >
              <Play size={14} className="text-[#52796F]" />
              <span>Preview In-Page Badge</span>
            </button>
            <button
              onClick={() => {
                const dest = `${originUrl}/?url=${encodeURIComponent(testUrlInput)}&source=bookmarklet`;
                window.open(dest, '_blank');
              }}
              className="bg-[#F8F7F2] hover:bg-[#E5E3DA] text-[#292F2D] border border-[#E5E3DA] px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Opens a new tab simulating bookmarklet redirection"
            >
              <ExternalLink size={14} className="text-[#52796F]" />
              <span>New Tab Flow</span>
            </button>
          </div>
        </div>

        {/* Backend API Test Result Box */}
        {apiTestError && (
          <div className="p-3.5 rounded-xl bg-[#F3D8D4] border border-[#E8B4B0] text-[#8A3028] text-xs flex items-center gap-2">
            <AlertOctagon size={16} className="shrink-0" />
            <span>Backend API Error: {apiTestError}</span>
          </div>
        )}

        {apiTestResult && (
          <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA] flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E3DA]">
              <span className="font-bold text-sm text-[#292F2D]">
                Backend Analysis Status: 200 OK (Verified)
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                  apiTestResult.riskLevel === 'HIGH RISK'
                    ? 'bg-[#F3D8D4] text-[#8A3028]'
                    : apiTestResult.riskLevel === 'MEDIUM RISK'
                    ? 'bg-[#F5E6C8] text-[#805B18]'
                    : 'bg-[#DDEBDD] text-[#315C3B]'
                }`}
              >
                {apiTestResult.riskLevel} ({apiTestResult.riskScore}/100)
              </span>
            </div>
            <p className="text-[#727873] leading-relaxed">
              <strong>Assessment:</strong> {apiTestResult.explanation}
            </p>
            {apiTestResult.warningSigns && apiTestResult.warningSigns.length > 0 && (
              <div>
                <strong className="text-[#805B18]">Warning Signs Detected:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[#292F2D]">
                  {apiTestResult.warningSigns.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating In-Page Scanner Modal Simulator */}
      {inPagePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border-2 border-[#E6C77A] shadow-2xl flex flex-col gap-4 relative animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E3DA]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#805B18]" />
                <strong className="font-bold text-sm text-[#292F2D]">PhishCode AI Live In-Page Scanner</strong>
              </div>
              <button
                onClick={() => setInPagePreviewOpen(false)}
                className="w-6 h-6 rounded-md bg-[#F8F7F2] text-[#727873] hover:text-[#292F2D] flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#F5E6C8] text-[#805B18] border border-[#E6C77A] p-3 rounded-xl flex items-center justify-between font-bold text-sm">
              <span>SUSPICIOUS PAGE (DEMO)</span>
              <span>75 / 100 Risk</span>
            </div>

            <div className="text-xs text-[#727873]">
              <strong>Current Page Host:</strong> {window.location.hostname || 'localhost'}
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-[#805B18] uppercase text-[11px]">Warning Indicators</p>
              <div className="p-2 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA] text-[#292F2D]">
                • Deceptive brand keywords detected in host or path
              </div>
              <div className="p-2 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA] text-[#292F2D]">
                • Password input field detected on active webpage
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setInPagePreviewOpen(false);
                  onTestConnection(testUrlInput);
                }}
                className="flex-1 bg-[#52796F] hover:bg-[#354F52] text-white py-2.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Open Full Report in PhishCode AI Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Architecture & Bookmarklet Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E3DA] p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#315C3B] font-semibold text-sm">
            <ShieldCheck size={18} />
            <h3>Privacy & Security Principles</h3>
          </div>
          <ul className="space-y-2 text-xs text-[#727873] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#315C3B]">•</span>
              <span><strong>URL Only:</strong> Evaluates purely the web address and page origin.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#315C3B]">•</span>
              <span><strong>Zero Credential Access:</strong> Does not touch cookies, session tokens, or private passwords.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#315C3B]">•</span>
              <span><strong>No Background Process:</strong> Does not consume CPU in the background when not clicked.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-[#E6C77A] bg-[#F5E6C8]/20 p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#805B18] font-semibold text-sm">
            <AlertTriangle size={18} />
            <h3>Important Tool Limitations</h3>
          </div>
          <ul className="space-y-2 text-xs text-[#805B18] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span><strong>Manually Activated:</strong> This bookmarklet runs ONLY when you deliberately click it. It is not background spyware.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span><strong>Browser Settings Pages:</strong> Cannot run on internal browser management pages (such as <code className="bg-white/50 px-1 rounded">chrome://settings</code>).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
