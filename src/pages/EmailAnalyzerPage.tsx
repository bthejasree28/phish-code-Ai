import React, { useState, useEffect } from 'react';
import { ScanResult } from '../types';
import { analyzeEmail } from '../utils/securityEngine';
import { ResultCard } from '../components/ResultCard';
import {
  Mail,
  Search,
  Sparkles,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface Props {
  onScanComplete: (result: ScanResult) => void;
  selectedResult?: ScanResult | null;
}

export const EmailAnalyzerPage: React.FC<Props> = ({
  onScanComplete,
  selectedResult,
}) => {
  const [emailText, setEmailText] = useState('');
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(selectedResult || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisNotes, setAiAnalysisNotes] = useState<any | null>(null);

  useEffect(() => {
    if (selectedResult && selectedResult.type === 'email') {
      setCurrentResult(selectedResult);
      setEmailText(selectedResult.inputPreview);
    }
  }, [selectedResult]);

  const executeScan = (textToScan: string) => {
    setErrorMessage(null);
    setAiAnalysisNotes(null);
    const cleaned = textToScan.trim();

    if (!cleaned) {
      setErrorMessage('Please paste or type the email content to analyze.');
      return;
    }

    if (cleaned.length < 15) {
      setErrorMessage('Please provide a more complete email excerpt (at least 15 characters).');
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      const result = analyzeEmail(cleaned);
      setCurrentResult(result);
      onScanComplete(result);
      setIsScanning(false);
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(emailText);
  };

  const handleClear = () => {
    setEmailText('');
    setCurrentResult(null);
    setErrorMessage(null);
    setAiAnalysisNotes(null);
  };

  // Preset realistic examples
  const sampleBankSuspension = `From: security-alert@online-chase-update.top
Subject: URGENT: Your Debit Card Access is Suspended within 24 Hours

Dear Customer,

We detected unauthorized transactions on your account. Immediate action required.
You must verify your identity immediately to prevent permanent account termination.
Please enter your password and provide your OTP verification code at the link below:
https://chase-security-verify.top/auth/login?session=9284

Failure to respond within 24 hours will result in legal action and account closure.

Sincerely,
Fraud Prevention Department`;

  const sampleCeoFraud = `Subject: Urgent Request - Immediate wire transfer for confidential vendor

Hi,

I am currently in an all-day executive board meeting and cannot take calls.
I need you to process an overdue payment wire transfer of $4,850 to our new supplier right away.
Or alternatively, please purchase 5 Apple gift cards of $100 each for client gifts and reply with the PIN numbers.
Keep this confidential until the public announcement.

Regards,
Executive Director`;

  const sampleLegitCampus = `From: registrar@university.edu
Subject: Spring Semester Course Registration Schedule

Dear Student,

Course registration for the upcoming semester will open next Tuesday at 9:00 AM on the official campus student portal (portal.university.edu).
Please review your degree audit and consult your academic advisor if you need prerequisite clearances.

Sincerely,
Office of the University Registrar`;

  const handleDeepAiAnalysis = async () => {
    if (!currentResult) return;
    setAiAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          content: emailText,
        }),
      });

      if (!res.ok) throw new Error('AI service offline');
      const data = await res.json();
      setAiAnalysisNotes(data);
    } catch {
      setAiAnalysisNotes({
        summary: 'AI cloud verification is running in fallback mode. The heuristic classification above represents the verified structural findings.',
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
          <div className="w-8 h-8 rounded-lg bg-[#F5E6C8] text-[#805B18] border border-[#E6C77A] flex items-center justify-center">
            <Mail size={18} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#292F2D] tracking-tight">
            Email Phishing Detector
          </h1>
        </div>
        <p className="text-sm text-[#727873] mt-1.5">
          Paste suspicious emails to uncover manufactured urgency, password or OTP harvesting, and spoofed identity claims.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl border border-[#E5E3DA] p-6 shadow-xs flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="email-input" className="text-xs font-semibold uppercase tracking-wider text-[#727873]">
              Paste Email Header & Body Content
            </label>
            {emailText && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-[#727873] hover:text-[#292F2D] underline"
              >
                Clear text
              </button>
            )}
          </div>

          <textarea
            id="email-input"
            rows={7}
            placeholder="Paste the suspicious email here (including subject, sender address, and message text)..."
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            className="w-full bg-[#F8F7F2] border border-[#E5E3DA] focus:border-[#52796F] focus:outline-none rounded-xl p-4 text-sm text-[#292F2D] placeholder-[#727873]/60 transition-colors font-sans"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-xs text-[#727873]">
              Tip: Never click hyperlinks directly inside suspicious emails.
            </span>
            <button
              type="submit"
              disabled={isScanning || !emailText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#52796F] hover:bg-[#354F52] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-xs cursor-pointer"
            >
              <Search size={16} />
              {isScanning ? 'Analyzing Patterns...' : 'Analyze Email'}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-[#F3D8D4] border border-[#E8B4B0] text-[#8A3028] text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Real-World Sample Presets */}
        <div className="pt-3 border-t border-[#E5E3DA] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#727873]">
            Load realistic training scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setEmailText(sampleBankSuspension);
                executeScan(sampleBankSuspension);
              }}
              className="text-xs bg-[#F3D8D4] hover:bg-[#E8B4B0] text-[#8A3028] px-3 py-1.5 rounded-lg border border-[#E8B4B0] transition-colors"
            >
              ⚠ Urgent Account Suspension & OTP Harvest
            </button>
            <button
              type="button"
              onClick={() => {
                setEmailText(sampleCeoFraud);
                executeScan(sampleCeoFraud);
              }}
              className="text-xs bg-[#F5E6C8] hover:bg-[#E6C77A] text-[#805B18] px-3 py-1.5 rounded-lg border border-[#E6C77A] transition-colors"
            >
              ⚠ Urgent Wire & Gift Card CEO Scam
            </button>
            <button
              type="button"
              onClick={() => {
                setEmailText(sampleLegitCampus);
                executeScan(sampleLegitCampus);
              }}
              className="text-xs bg-[#DDEBDD] hover:bg-[#CAD8C5] text-[#315C3B] px-3 py-1.5 rounded-lg border border-[#CAD8C5] transition-colors"
            >
              ✓ Official University Schedule Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {currentResult && (
        <div className="flex flex-col gap-6">
          <ResultCard result={currentResult} />

          {/* AI Deep Reasoning */}
          <div className="bg-white rounded-xl border border-[#E5E3DA] p-5 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold text-sm text-[#292F2D] flex items-center gap-2">
                  <Sparkles size={16} className="text-[#52796F]" />
                  AI Deep Reasoning (Gemini 3.8)
                </h4>
                <p className="text-xs text-[#727873]">
                  Evaluate subtle psychological triggers or context in this email text.
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
