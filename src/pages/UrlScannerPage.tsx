import React, { useState, useEffect } from 'react';
import { ScanResult } from '../types';
import { analyzeUrl } from '../utils/securityEngine';
import { ResultCard } from '../components/ResultCard';
import {
  Link2,
  Search,
  RotateCcw,
  Sparkles,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface Props {
  initialUrl?: string;
  isFromBookmarklet?: boolean;
  onScanComplete: (result: ScanResult) => void;
  selectedResult?: ScanResult | null;
}

export const UrlScannerPage: React.FC<Props> = ({
  initialUrl = '',
  isFromBookmarklet = false,
  onScanComplete,
  selectedResult,
}) => {
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(selectedResult || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisNotes, setAiAnalysisNotes] = useState<any | null>(null);

  // If initial URL is provided (e.g. from bookmarklet query parameter), auto-run scan safely
  useEffect(() => {
    if (initialUrl && initialUrl.trim()) {
      setUrlInput(initialUrl);
      executeScan(initialUrl);
    }
  }, [initialUrl]);

  useEffect(() => {
    if (selectedResult && selectedResult.type === 'url') {
      setCurrentResult(selectedResult);
      setUrlInput(selectedResult.inputPreview);
    }
  }, [selectedResult]);

  const executeScan = (targetUrl: string) => {
    setErrorMessage(null);
    setAiAnalysisNotes(null);
    const cleaned = targetUrl.trim();

    if (!cleaned) {
      setErrorMessage('Please enter or paste a website URL to scan.');
      return;
    }

    // Security check: Never accept javascript: or data: pseudoprotocols
    if (/^javascript:/i.test(cleaned) || /^data:/i.test(cleaned) || /^vbscript:/i.test(cleaned)) {
      setErrorMessage('Invalid URL protocol. Only standard web addresses (HTTP/HTTPS) are evaluated.');
      return;
    }

    setIsScanning(true);

    // Run structural & heuristic analysis
    setTimeout(() => {
      const result = analyzeUrl(cleaned);
      setCurrentResult(result);
      onScanComplete(result);
      setIsScanning(false);
    }, 200);
  };

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(urlInput);
  };

  const handleSampleClick = (sample: string) => {
    setUrlInput(sample);
    executeScan(sample);
  };

  const handleClear = () => {
    setUrlInput('');
    setCurrentResult(null);
    setErrorMessage(null);
    setAiAnalysisNotes(null);
  };

  // Optional AI-assisted in-depth reasoning
  const handleDeepAiAnalysis = async () => {
    if (!currentResult) return;
    setAiAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'url',
          content: urlInput,
        }),
      });

      if (!res.ok) {
        throw new Error('AI analysis service unavailable');
      }

      const data = await res.json();
      setAiAnalysisNotes(data);
    } catch (err: any) {
      console.warn('AI analysis fallback:', err);
      setAiAnalysisNotes({
        summary: 'AI cloud verification is currently in offline mode. Heuristic structural findings remain authoritative.',
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto w-full">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#DDEBDD] text-[#315C3B] flex items-center justify-center">
            <Link2 size={18} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#292F2D] tracking-tight">
            URL Phishing Scanner
          </h1>
        </div>
        <p className="text-sm text-[#727873] mt-1.5">
          Evaluate links for brand spoofing, deceptive subdomains, suspicious TLDs, and structural anomalies before clicking.
        </p>
      </div>

      {/* Bookmarklet Reception Notification Banner */}
      {isFromBookmarklet && (
        <div className="bg-[#DDEBDD] border border-[#CAD8C5] p-4 rounded-xl flex items-start gap-3 text-[#315C3B]">
          <Bookmark size={20} className="shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-semibold">URL Received from PhishCode AI Browser Bookmarklet</p>
            <p className="text-[#315C3B]/90 mt-0.5">
              The address was safely passed as an encoded parameter. The target website was NOT executed or navigated to.
            </p>
          </div>
        </div>
      )}

      {/* Input Card */}
      <div className="bg-white rounded-xl border border-[#E5E3DA] p-6 shadow-xs flex flex-col gap-4">
        <form onSubmit={handleManualScan} className="flex flex-col gap-3">
          <label htmlFor="url-input" className="text-xs font-semibold uppercase tracking-wider text-[#727873]">
            Target Website Address (URL)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                id="url-input"
                type="text"
                placeholder="e.g., https://secure-login.example.com or paste any link"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E5E3DA] focus:border-[#52796F] focus:outline-none rounded-xl px-4 py-3 text-sm text-[#292F2D] placeholder-[#727873]/60 transition-colors"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#727873] hover:text-[#292F2D] bg-[#E5E3DA] px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isScanning || !urlInput.trim()}
              className="inline-flex items-center justify-center gap-2 bg-[#52796F] hover:bg-[#354F52] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Search size={16} />
              {isScanning ? 'Analyzing...' : 'Scan URL'}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-[#F3D8D4] border border-[#E8B4B0] text-[#8A3028] text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Test Presets */}
        <div className="pt-2 border-t border-[#E5E3DA] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#727873]">
            Or test with real-world threat patterns:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSampleClick('https://www.stanford.edu/academics/')}
              className="text-xs bg-[#DDEBDD] hover:bg-[#CAD8C5] text-[#315C3B] px-3 py-1.5 rounded-lg border border-[#CAD8C5] transition-colors"
            >
              ✓ Stanford University (.edu)
            </button>
            <button
              type="button"
              onClick={() =>
                handleSampleClick('https://paypal.com.verification-security-portal.xyz/login')
              }
              className="text-xs bg-[#F5E6C8] hover:bg-[#E6C77A] text-[#805B18] px-3 py-1.5 rounded-lg border border-[#E6C77A] transition-colors"
            >
              ⚠ PayPal Spoofed Subdomain (.xyz)
            </button>
            <button
              type="button"
              onClick={() => handleSampleClick('http://192.168.1.105:8080/secure-update')}
              className="text-xs bg-[#F3D8D4] hover:bg-[#E8B4B0] text-[#8A3028] px-3 py-1.5 rounded-lg border border-[#E8B4B0] transition-colors"
            >
              ⚠ Raw IP Host & Non-Standard Port
            </button>
            <button
              type="button"
              onClick={() => handleSampleClick('g00gle-login.example.com')}
              className="text-xs bg-[#F3D8D4] hover:bg-[#E8B4B0] text-[#8A3028] px-3 py-1.5 rounded-lg border border-[#E8B4B0] transition-colors"
            >
              ⚠ Google Typosquatting (g00gle-login.example.com)
            </button>
            <button
              type="button"
              onClick={() => handleSampleClick('http://apple-support-recovery.top/verify-id')}
              className="text-xs bg-[#F3D8D4] hover:bg-[#E8B4B0] text-[#8A3028] px-3 py-1.5 rounded-lg border border-[#E8B4B0] transition-colors"
            >
              ⚠ Apple Impersonation (.top)
            </button>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {currentResult && (
        <div className="flex flex-col gap-6">
          <ResultCard result={currentResult} />

          {/* Optional AI Second Opinion */}
          <div className="bg-white rounded-xl border border-[#E5E3DA] p-5 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold text-sm text-[#292F2D] flex items-center gap-2">
                  <Sparkles size={16} className="text-[#52796F]" />
                  AI Second Opinion (Gemini 3.8)
                </h4>
                <p className="text-xs text-[#727873]">
                  Ask Gemini model for contextual reasoning on this specific address.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeepAiAnalysis}
                disabled={aiAnalyzing}
                className="inline-flex items-center justify-center gap-1.5 bg-[#F8F7F2] hover:bg-[#E5E3DA] text-[#292F2D] border border-[#E5E3DA] px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Sparkles size={14} className="text-[#52796F]" />
                {aiAnalyzing ? 'Analyzing with AI...' : 'Run AI Evaluation'}
              </button>
            </div>

            {aiAnalysisNotes && (
              <div className="mt-2 p-3.5 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA] text-xs leading-relaxed text-[#292F2D] flex flex-col gap-2">
                <p>
                  <strong>AI Summary:</strong> {aiAnalysisNotes.summary}
                </p>
                {aiAnalysisNotes.explanation && (
                  <p>
                    <strong>Detailed Context:</strong> {aiAnalysisNotes.explanation}
                  </p>
                )}
                {aiAnalysisNotes.warningSigns && aiAnalysisNotes.warningSigns.length > 0 && (
                  <div>
                    <strong>AI Flagged Indicators:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      {aiAnalysisNotes.warningSigns.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
