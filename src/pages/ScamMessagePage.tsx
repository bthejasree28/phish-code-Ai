import React, { useState, useEffect } from 'react';
import { ScanResult } from '../types';
import { analyzeMessage } from '../utils/securityEngine';
import { ResultCard } from '../components/ResultCard';
import {
  MessageSquareWarning,
  Search,
  Sparkles,
  AlertCircle,
  Smartphone,
} from 'lucide-react';

interface Props {
  onScanComplete: (result: ScanResult) => void;
  selectedResult?: ScanResult | null;
}

export const ScamMessagePage: React.FC<Props> = ({
  onScanComplete,
  selectedResult,
}) => {
  const [messageText, setMessageText] = useState('');
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(selectedResult || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisNotes, setAiAnalysisNotes] = useState<any | null>(null);

  useEffect(() => {
    if (selectedResult && selectedResult.type === 'message') {
      setCurrentResult(selectedResult);
      setMessageText(selectedResult.inputPreview);
    }
  }, [selectedResult]);

  const executeScan = (raw: string) => {
    setErrorMessage(null);
    setAiAnalysisNotes(null);
    const cleaned = raw.trim();

    if (!cleaned) {
      setErrorMessage('Please paste or type the SMS or chat message to check.');
      return;
    }

    if (cleaned.length < 10) {
      setErrorMessage('Please provide a longer message sample (at least 10 characters).');
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      const result = analyzeMessage(cleaned);
      setCurrentResult(result);
      onScanComplete(result);
      setIsScanning(false);
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(messageText);
  };

  const handleClear = () => {
    setMessageText('');
    setCurrentResult(null);
    setErrorMessage(null);
    setAiAnalysisNotes(null);
  };

  // Preset realistic smishing & scam messages
  const sampleUspsSmishing = `[USPS Alert]: Your package could not be delivered on 10/09 due to an incomplete street address. Please update your details and pay $0.35 redelivery fee at https://usps-redelivery-post.top/track within 12 hours.`;

  const sampleBankSmishing = `CHASE ALERT: Unauthorized card charge of $749.20 at BESTBUY on 10/09. If this was NOT you, immediately visit https://chase-fraud-cancel.top or call 1-800-FAKE-NUM to freeze card.`;

  const sampleHiMomScam = `Hi mom, I accidentally dropped my phone in water and this is my temporary new number. I have an urgent bill due today and my banking app is locked on this new device. Could you please wire $450 to my landlord via Zelle right now?`;

  const sampleJobScam = `Hello! We have an exciting remote part-time job offer. Work 15-30 minutes daily evaluating merchant products and earn $200-$800 daily payout. No experience required. Contact recruiter on Telegram @FastCashTasks to claim your bonus.`;

  const sampleLegitAuth = `Your GitHub authentication code is 482910. Valid for 10 minutes. If you did not request this, review your recent security log at https://github.com/settings/security.`;

  const handleDeepAiAnalysis = async () => {
    if (!currentResult) return;
    setAiAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          content: messageText,
        }),
      });

      if (!res.ok) throw new Error('AI service offline');
      const data = await res.json();
      setAiAnalysisNotes(data);
    } catch {
      setAiAnalysisNotes({
        summary: 'AI cloud verification is currently running offline. The heuristic rules engine assessment above is fully active.',
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
          <div className="w-8 h-8 rounded-lg bg-[#CAD8C5] text-[#292F2D] flex items-center justify-center">
            <Smartphone size={18} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#292F2D] tracking-tight">
            Scam Message Analyzer
          </h1>
        </div>
        <p className="text-sm text-[#727873] mt-1.5">
          Detect mobile smishing, fake delivery alerts, fake job offers, and urgent money requests on SMS, WhatsApp, and Telegram.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-xl border border-[#E5E3DA] p-6 shadow-xs flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="message-input" className="text-xs font-semibold uppercase tracking-wider text-[#727873]">
              Paste Suspicious SMS or Chat Text
            </label>
            {messageText && (
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
            id="message-input"
            rows={5}
            placeholder="Paste SMS text, WhatsApp message, Telegram direct message, or delivery alert..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full bg-[#F8F7F2] border border-[#E5E3DA] focus:border-[#52796F] focus:outline-none rounded-xl p-4 text-sm text-[#292F2D] placeholder-[#727873]/60 transition-colors font-sans"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-xs text-[#727873]">
              Do not reply or click links sent by unrecognized numbers.
            </span>
            <button
              type="submit"
              disabled={isScanning || !messageText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#52796F] hover:bg-[#354F52] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-xs cursor-pointer"
            >
              <Search size={16} />
              {isScanning ? 'Checking Message...' : 'Check Message'}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-[#F3D8D4] border border-[#E8B4B0] text-[#8A3028] text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Real-World Presets */}
        <div className="pt-3 border-t border-[#E5E3DA] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#727873]">
            Common mobile scams to test:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setMessageText(sampleUspsSmishing);
                executeScan(sampleUspsSmishing);
              }}
              className="text-xs bg-[#F3D8D4] hover:bg-[#E8B4B0] text-[#8A3028] px-3 py-1.5 rounded-lg border border-[#E8B4B0] transition-colors"
            >
              ⚠ USPS Package Missing Address
            </button>
            <button
              type="button"
              onClick={() => {
                setMessageText(sampleBankSmishing);
                executeScan(sampleBankSmishing);
              }}
              className="text-xs bg-[#F3D8D4] hover:bg-[#E8B4B0] text-[#8A3028] px-3 py-1.5 rounded-lg border border-[#E8B4B0] transition-colors"
            >
              ⚠ Urgent Bank Card Blocked Alert
            </button>
            <button
              type="button"
              onClick={() => {
                setMessageText(sampleHiMomScam);
                executeScan(sampleHiMomScam);
              }}
              className="text-xs bg-[#F5E6C8] hover:bg-[#E6C77A] text-[#805B18] px-3 py-1.5 rounded-lg border border-[#E6C77A] transition-colors"
            >
              ⚠ "Hi Mom, Broke My Phone" Money Request
            </button>
            <button
              type="button"
              onClick={() => {
                setMessageText(sampleJobScam);
                executeScan(sampleJobScam);
              }}
              className="text-xs bg-[#F5E6C8] hover:bg-[#E6C77A] text-[#805B18] px-3 py-1.5 rounded-lg border border-[#E6C77A] transition-colors"
            >
              ⚠ Telegram $500/day Part-Time Job Scam
            </button>
            <button
              type="button"
              onClick={() => {
                setMessageText(sampleLegitAuth);
                executeScan(sampleLegitAuth);
              }}
              className="text-xs bg-[#DDEBDD] hover:bg-[#CAD8C5] text-[#315C3B] px-3 py-1.5 rounded-lg border border-[#CAD8C5] transition-colors"
            >
              ✓ Standard 2FA Code Notice
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
                  Evaluate social engineering nuances in this message.
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
