import React, { useState, useEffect } from 'react';
import { TabType, ScanResult, ScanStats } from './types';
import { getScanHistory, saveScanResult, clearScanHistory, deleteScanResult, getScanStats } from './utils/historyStorage';
import { validateIncomingUrl } from './utils/bookmarkletHelper';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UrlScannerPage } from './pages/UrlScannerPage';
import { EmailAnalyzerPage } from './pages/EmailAnalyzerPage';
import { ScamMessagePage } from './pages/ScamMessagePage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { BrowserProtectionPage } from './pages/BrowserProtectionPage';
import { ChromeExtensionPage } from './pages/ChromeExtensionPage';
import { SecurityTipsPage } from './pages/SecurityTipsPage';
import { HistoryPage } from './pages/HistoryPage';
import { Shield, Lock, Heart, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [incomingUrl, setIncomingUrl] = useState<string>('');
  const [isFromBookmarklet, setIsFromBookmarklet] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);

  // Load history from localStorage on startup
  useEffect(() => {
    const stored = getScanHistory();
    setHistory(stored);

    // Check for bookmarklet or deep-link URL query parameters
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlCandidate = searchParams.get('url') || searchParams.get('scanUrl');
      const tabCandidate = searchParams.get('tab');
      const sourceCandidate = searchParams.get('source');

      if (urlCandidate) {
        const validated = validateIncomingUrl(urlCandidate);
        if (validated) {
          setIncomingUrl(validated);
          setIsFromBookmarklet(sourceCandidate === 'bookmarklet' || true);
          setCurrentTab('url-scanner');
        }
      } else if (tabCandidate && isValidTab(tabCandidate)) {
        setCurrentTab(tabCandidate as TabType);
      }
    } catch (e) {
      console.warn('Could not parse window.location query params:', e);
    }
  }, []);

  const isValidTab = (tab: string): boolean => {
    const valid: TabType[] = [
      'home',
      'dashboard',
      'url-scanner',
      'email-analyzer',
      'message-checker',
      'ai-assistant',
      'browser-protection',
      'chrome-extension',
      'security-tips',
      'history',
    ];
    return valid.includes(tab as TabType);
  };

  const handleSelectTab = (tab: TabType) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScanComplete = (result: ScanResult) => {
    const updated = saveScanResult(result);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearScanHistory();
    setHistory([]);
  };

  const handleDeleteItem = (id: string) => {
    const updated = deleteScanResult(id);
    setHistory(updated);
  };

  const handleViewResult = (result: ScanResult) => {
    setSelectedResult(result);
    if (result.type === 'url') {
      setCurrentTab('url-scanner');
    } else if (result.type === 'email') {
      setCurrentTab('email-analyzer');
    } else {
      setCurrentTab('message-checker');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTestConnectionFromBookmarklet = (testUrl: string) => {
    const validated = validateIncomingUrl(testUrl);
    if (validated) {
      setIncomingUrl(validated);
      setIsFromBookmarklet(true);
      setCurrentTab('url-scanner');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const stats: ScanStats = getScanStats(history);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2] text-[#292F2D]">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        scanCount={history.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {currentTab === 'home' && (
          <LandingPage onSelectTab={handleSelectTab} />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            history={history}
            onSelectTab={handleSelectTab}
            onViewResult={handleViewResult}
          />
        )}

        {currentTab === 'url-scanner' && (
          <UrlScannerPage
            initialUrl={incomingUrl}
            isFromBookmarklet={isFromBookmarklet}
            onScanComplete={handleScanComplete}
            selectedResult={selectedResult}
          />
        )}

        {currentTab === 'email-analyzer' && (
          <EmailAnalyzerPage
            onScanComplete={handleScanComplete}
            selectedResult={selectedResult}
          />
        )}

        {currentTab === 'message-checker' && (
          <ScamMessagePage
            onScanComplete={handleScanComplete}
            selectedResult={selectedResult}
          />
        )}

        {currentTab === 'ai-assistant' && <AiAssistantPage />}

        {(currentTab === 'chrome-extension' || currentTab === 'browser-protection') && (
          <ChromeExtensionPage />
        )}

        {currentTab === 'security-tips' && <SecurityTipsPage />}

        {currentTab === 'history' && (
          <HistoryPage
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteItem}
            onSelectTab={handleSelectTab}
          />
        )}
      </main>

      {/* Trustworthy, Human-Centered Footer */}
      <footer className="bg-white border-t border-[#E5E3DA] py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#52796F] text-white flex items-center justify-center">
                <Shield size={14} />
              </div>
              <span className="font-bold text-sm text-[#292F2D]">PhishCode AI</span>
              <span className="text-xs text-[#727873]">• College Hackathon Cybersecurity Project</span>
            </div>
            <p className="text-xs text-[#727873] max-w-lg">
              Designed for everyday users. Heuristic evaluations are performed locally with zero persistent surveillance, no browser extension dependencies, and transparent scoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#727873]">
            <button
              onClick={() => handleSelectTab('chrome-extension')}
              className="hover:text-[#292F2D] cursor-pointer"
            >
              Chrome Extension (MV3)
            </button>
            <span>•</span>
            <button
              onClick={() => handleSelectTab('security-tips')}
              className="hover:text-[#292F2D] cursor-pointer"
            >
              Security Awareness
            </button>
            <span>•</span>
            <button
              onClick={() => handleSelectTab('ai-assistant')}
              className="hover:text-[#292F2D] cursor-pointer"
            >
              AI Assistant
            </button>
            <span>•</span>
            <button
              onClick={() => handleSelectTab('history')}
              className="hover:text-[#292F2D] cursor-pointer"
            >
              Local Logs ({history.length})
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
