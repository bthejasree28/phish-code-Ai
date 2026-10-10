import React, { useState } from 'react';
import { EXTENSION_ZIP_BASE64 } from '../utils/extensionZipBase64';
import { EXTENSION_TEXT_FILES, EXTENSION_ICONS_BASE64 } from '../utils/extensionFilesData';
import {
  Download,
  FolderArchive,
  Chrome,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  ArrowRight,
  ExternalLink,
  Laptop,
  Check,
  FileCode,
  Play,
  RotateCcw,
  Copy,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Mail,
  RefreshCw,
} from 'lucide-react';

export const ChromeExtensionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'windows' | 'mac'>('windows');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('manifest.json');
  const [activeViewMode, setActiveViewMode] = useState<
    'zip-install' | 'gmail-guide' | 'manual-files' | 'simulator'
  >('zip-install');

  // Simulator State
  const [simMode, setSimMode] = useState<'gmail' | 'web'>('gmail');
  const [simulatedEmail, setSimulatedEmail] = useState<'phish' | 'safe'>('phish');
  const [simulatedUrl, setSimulatedUrl] = useState(
    'https://paypal.com.verification-security-portal.xyz/login'
  );
  const [simState, setSimState] = useState<'idle' | 'loading' | 'result'>('result');

  // Trigger high-reliability binary ZIP download directly from pre-verified base64 bytes
  const handleDownloadZip = () => {
    try {
      const binaryString = atob(EXTENSION_ZIP_BASE64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/zip' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'phishcode-ai-chrome-extension.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      setDownloadSuccessMessage(
        'Valid Chrome Extension ZIP downloaded successfully! It contains all Manifest V3 files (manifest.json, content.js for Gmail, content.css, popup.html, popup.js, popup.css, icons, and README.md) formatted for Windows File Explorer extraction.'
      );
    } catch (err: any) {
      console.error('Blob download fallback:', err);
      // Direct server fallback
      window.location.href = '/api/download-extension';
    }
  };

  // Copy individual file contents to clipboard
  const handleCopyFileContent = (fileName: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  // Download individual file as text or binary
  const handleDownloadSingleFile = (fileName: string) => {
    if (EXTENSION_TEXT_FILES[fileName]) {
      const content = EXTENSION_TEXT_FILES[fileName];
      const mime = fileName.endsWith('.json')
        ? 'application/json'
        : fileName.endsWith('.html')
        ? 'text/html'
        : fileName.endsWith('.css')
        ? 'text/css'
        : fileName.endsWith('.js')
        ? 'text/javascript'
        : 'text/markdown';

      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (EXTENSION_ICONS_BASE64[fileName]) {
      const b64 = EXTENSION_ICONS_BASE64[fileName];
      const byteCharacters = atob(b64);
      const bytes = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        bytes[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const runSimulation = () => {
    setSimState('loading');
    setTimeout(() => {
      setSimState('result');
    }, 400);
  };

  return (
    <div className="flex flex-col gap-10 py-6 max-w-5xl mx-auto w-full">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#52796F] text-white flex items-center justify-center">
            <Mail size={20} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#292F2D] tracking-tight">
            Gmail Phishing Detection Chrome Extension
          </h1>
        </div>
        <p className="text-sm text-[#727873] mt-1.5 max-w-3xl leading-relaxed">
          Integrated with Gmail at <code className="bg-white px-1.5 py-0.5 rounded border border-[#E5E3DA] text-[#52796F] font-mono text-xs">mail.google.com</code>.
          Detects when you open an email, analyzes sender address, subject, message text, and hyperlink destinations, and displays real-time risk indicators directly inside Gmail.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E5E3DA] shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#DDEBDD] text-[#315C3B] flex items-center justify-center shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-[#292F2D]">In-Gmail Integration</h3>
            <p className="text-xs text-[#727873] mt-0.5">
              Injects clear security banners directly above email messages inside Gmail.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E3DA] shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#CAD8C5] text-[#292F2D] flex items-center justify-center shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-[#292F2D]">100% Client-Side Privacy</h3>
            <p className="text-xs text-[#727873] mt-0.5">
              Analyzes emails locally in browser memory. Zero transmissions to external servers.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5E3DA] shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F5E6C8] text-[#805B18] flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-[#292F2D]">Manifest V3 Standard</h3>
            <p className="text-xs text-[#727873] mt-0.5">
              Uses lightweight content scripts and host permissions strictly for mail.google.com.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E3DA] pb-2">
        <button
          onClick={() => setActiveViewMode('zip-install')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeViewMode === 'zip-install'
              ? 'bg-[#52796F] text-white shadow-xs'
              : 'bg-white text-[#727873] hover:text-[#292F2D] border border-[#E5E3DA]'
          }`}
        >
          <FolderArchive size={16} />
          <span>Download ZIP & Install Guide</span>
        </button>

        <button
          onClick={() => setActiveViewMode('gmail-guide')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeViewMode === 'gmail-guide'
              ? 'bg-[#52796F] text-white shadow-xs'
              : 'bg-white text-[#727873] hover:text-[#292F2D] border border-[#E5E3DA]'
          }`}
        >
          <Mail size={16} />
          <span>How to Update & Test in Gmail</span>
        </button>

        <button
          onClick={() => setActiveViewMode('manual-files')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeViewMode === 'manual-files'
              ? 'bg-[#52796F] text-white shadow-xs'
              : 'bg-white text-[#727873] hover:text-[#292F2D] border border-[#E5E3DA]'
          }`}
        >
          <FileCode size={16} />
          <span>Individual Files (Inspect & Copy Code)</span>
        </button>

        <button
          onClick={() => setActiveViewMode('simulator')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeViewMode === 'simulator'
              ? 'bg-[#52796F] text-white shadow-xs'
              : 'bg-white text-[#727873] hover:text-[#292F2D] border border-[#E5E3DA]'
          }`}
        >
          <Play size={15} />
          <span>Live In-Gmail Preview Simulator</span>
        </button>
      </div>

      {/* Main Download Card */}
      <div className="bg-white rounded-2xl border border-[#E5E3DA] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#E5E3DA]">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#DDEBDD] text-[#315C3B] flex items-center justify-center shrink-0">
              <FolderArchive size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#292F2D]">
                  PhishCode AI Extension Package (with Gmail Support)
                </h2>
                <span className="text-[11px] font-bold uppercase bg-[#DDEBDD] text-[#315C3B] px-2 py-0.5 rounded-full border border-[#CAD8C5]">
                  Verified Archive
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#727873] mt-1 leading-relaxed">
                Contains complete source files: <code className="bg-[#F8F7F2] px-1 rounded text-[#292F2D]">manifest.json</code>, <code className="bg-[#F8F7F2] px-1 rounded text-[#292F2D]">content.js</code> (Gmail analyzer), <code className="bg-[#F8F7F2] px-1 rounded text-[#292F2D]">content.css</code> (Gmail card styles), <code className="bg-[#F8F7F2] px-1 rounded text-[#292F2D]">popup.html</code>, <code className="bg-[#F8F7F2] px-1 rounded text-[#292F2D]">popup.js</code>, <code className="bg-[#F8F7F2] px-1 rounded text-[#292F2D]">popup.css</code>, icons, and <code className="bg-[#F8F7F2] px-1 rounded text-[#292F2D]">README.md</code>.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#727873] mt-2">
                <span>• File Size: ~21.3 KB</span>
                <span>• Standard PKZIP (Windows File Explorer Compatible)</span>
                <span>• Manifest: V3 (Gmail + activeTab)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleDownloadZip}
              className="inline-flex items-center justify-center gap-2 bg-[#52796F] hover:bg-[#354F52] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-xs cursor-pointer text-center"
            >
              <Download size={18} />
              <span>Download Extension (.ZIP)</span>
            </button>
          </div>
        </div>

        {downloadSuccessMessage && (
          <div className="p-4 rounded-xl bg-[#DDEBDD] border border-[#CAD8C5] text-[#315C3B] text-xs sm:text-sm flex items-start gap-3">
            <CheckCircle size={20} className="shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-bold">Download Ready</p>
              <p>{downloadSuccessMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: ZIP Installation Instructions */}
      {activeViewMode === 'zip-install' && (
        <div className="bg-white rounded-2xl border border-[#E5E3DA] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E3DA] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#292F2D] flex items-center gap-2">
                <Laptop size={20} className="text-[#52796F]" />
                Windows Step-by-Step Chrome Installation Guide
              </h2>
              <p className="text-xs sm:text-sm text-[#727873] mt-0.5">
                Takes under 60 seconds using the downloaded ZIP file.
              </p>
            </div>

            <div className="flex rounded-lg bg-[#F8F7F2] p-1 border border-[#E5E3DA]">
              <button
                onClick={() => setActiveTab('windows')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'windows' ? 'bg-white text-[#292F2D] shadow-xs' : 'text-[#727873]'
                }`}
              >
                Windows Instructions
              </button>
              <button
                onClick={() => setActiveTab('mac')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'mac' ? 'bg-white text-[#292F2D] shadow-xs' : 'text-[#727873]'
                }`}
              >
                Mac Instructions
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#52796F] text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-[#292F2D]">Extract the ZIP Archive</h3>
              </div>
              <p className="text-xs text-[#727873] leading-relaxed">
                In your Windows Downloads folder, right-click <code className="bg-white px-1 rounded text-[#292F2D]">phishcode-ai-chrome-extension.zip</code> and select <strong>"Extract All..."</strong>. Click Extract.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#52796F] text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-sm text-[#292F2D]">Open Extensions in Chrome</h3>
              </div>
              <p className="text-xs text-[#727873] leading-relaxed">
                Open Google Chrome. Type <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[#52796F]">chrome://extensions</code> in your address bar and press <strong>Enter</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#52796F] text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-sm text-[#292F2D]">Turn ON Developer Mode</h3>
              </div>
              <p className="text-xs text-[#727873] leading-relaxed">
                In the top-right corner of the Extensions page, toggle the switch labeled <strong>"Developer mode"</strong> to <strong>ON</strong>.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#52796F] text-white font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="font-bold text-sm text-[#292F2D]">Click "Load Unpacked"</h3>
              </div>
              <p className="text-xs text-[#727873] leading-relaxed">
                Click the <strong>"Load unpacked"</strong> button in the top-left corner. Select the extracted folder (the directory containing <code className="bg-white px-1 rounded text-[#292F2D]">manifest.json</code>).
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#52796F] text-white font-bold text-xs flex items-center justify-center">
                  5
                </span>
                <h3 className="font-bold text-sm text-[#292F2D]">Pin to Chrome Toolbar</h3>
              </div>
              <p className="text-xs text-[#727873] leading-relaxed">
                Click the puzzle piece icon (Extensions menu) on your Chrome toolbar. Click the <strong>Pin icon</strong> next to PhishCode AI.
              </p>
            </div>

            {/* Step 6 */}
            <div className="p-4 rounded-xl bg-[#DDEBDD] border border-[#CAD8C5] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#315C3B] text-white font-bold text-xs flex items-center justify-center">
                  ✓
                </span>
                <h3 className="font-bold text-sm text-[#315C3B]">Ready to Protect!</h3>
              </div>
              <p className="text-xs text-[#315C3B] leading-relaxed">
                Open <strong>mail.google.com</strong> or any website. PhishCode AI will actively detect phishing emails and inspect suspicious web addresses!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Gmail Update & Testing Guide */}
      {activeViewMode === 'gmail-guide' && (
        <div className="bg-white rounded-2xl border border-[#E5E3DA] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="border-b border-[#E5E3DA] pb-4">
            <h2 className="text-lg font-bold text-[#292F2D] flex items-center gap-2">
              <Mail size={20} className="text-[#52796F]" />
              How to Update Installed Extension and Test in Gmail
            </h2>
            <p className="text-xs sm:text-sm text-[#727873] mt-0.5">
              Follow these simple steps to refresh your extension and see real-time protection in action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Updating Existing Extension */}
            <div className="flex flex-col gap-3 p-5 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA]">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="text-[#52796F]" />
                <h3 className="font-bold text-sm text-[#292F2D]">1. Update Your Currently Installed Extension</h3>
              </div>
              <ol className="list-decimal list-inside text-xs text-[#727873] space-y-2 leading-relaxed">
                <li>Download the updated ZIP archive and extract it over your folder (or into a new folder).</li>
                <li>Go to <code className="bg-white px-1.5 py-0.5 rounded text-[#52796F] font-mono">chrome://extensions</code> in Chrome.</li>
                <li>Find <strong>PhishCode AI</strong> in the list of extensions.</li>
                <li>Click the circular <strong>Reload</strong> icon on the card to refresh code changes.</li>
                <li>If you already have Gmail open in a tab, refresh that tab with <kbd className="bg-white px-1 border rounded">Ctrl + R</kbd> or <kbd className="bg-white px-1 border rounded">F5</kbd>.</li>
              </ol>
            </div>

            {/* Testing in Gmail */}
            <div className="flex flex-col gap-3 p-5 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA]">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-[#52796F]" />
                <h3 className="font-bold text-sm text-[#292F2D]">2. How to Test in Gmail (mail.google.com)</h3>
              </div>
              <ol className="list-decimal list-inside text-xs text-[#727873] space-y-2 leading-relaxed">
                <li>Navigate to <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="text-[#52796F] font-semibold underline">mail.google.com</a>.</li>
                <li>Open any email in your inbox or spam folder.</li>
                <li>Notice the <strong>PhishCode AI Security Card</strong> inserted automatically right above the email body.</li>
                <li>Check the risk indicator:
                  <ul className="list-disc list-inside ml-3 mt-1 space-y-1">
                    <li><strong className="text-[#315C3B]">SAFE-LOOKING:</strong> Green badge with clean domain checks.</li>
                    <li><strong className="text-[#805B18]">SUSPICIOUS:</strong> Amber badge with pressure or generic salutation warnings.</li>
                    <li><strong className="text-[#8A3028]">HIGH RISK:</strong> Red badge with brand spoofing or credential theft alerts.</li>
                  </ul>
                </li>
                <li>Click <strong>"View Details"</strong> to see sender address, subject, and checked link destinations.</li>
              </ol>
            </div>
          </div>

          {/* Privacy Callout */}
          <div className="p-4 rounded-xl bg-[#DDEBDD] border border-[#CAD8C5] text-[#315C3B] text-xs sm:text-sm flex items-start gap-3">
            <Lock size={20} className="shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-bold">Privacy & Security Guarantee</p>
              <p>
                PhishCode AI performs all email evaluations <strong>strictly client-side in browser memory</strong>. No email subjects, sender emails, or body text are ever transmitted to any backend server or external API without your explicit consent. Passwords, cookies, and other personal data are never collected.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Manual Individual Files (Copy & Download Every File) */}
      {activeViewMode === 'manual-files' && (
        <div className="bg-white rounded-2xl border border-[#E5E3DA] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-[#292F2D] flex items-center gap-2">
              <FileCode size={20} className="text-[#52796F]" />
              Manual Extension File Setup (Inspect, Copy & Save)
            </h2>
            <p className="text-xs sm:text-sm text-[#727873] mt-0.5">
              If you prefer to build the folder manually or if your browser environment blocks ZIP downloads, you can copy the full code or download each file separately.
            </p>
          </div>

          {/* Folder Structure Blueprint */}
          <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA] text-xs">
            <p className="font-bold text-[#292F2D] mb-1.5">Required Folder Layout:</p>
            <pre className="font-mono text-[#52796F] text-xs">
{`my-extension-folder/
├── manifest.json       (Extension config with mail.google.com permissions)
├── content.js          (In-Gmail DOM email, sender & link heuristic scanner)
├── content.css         (In-Gmail security badge card styling)
├── popup.html          (Toolbar popup UI with Web & Gmail views)
├── popup.css           (Modern theme styling)
├── popup.js            (Active tab web analyzer logic)
├── README.md           (Installation & testing instructions)
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png`}
            </pre>
          </div>

          {/* File Selector Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#E5E3DA] pb-3">
            {Object.keys(EXTENSION_TEXT_FILES).map((fname) => (
              <button
                key={fname}
                onClick={() => setSelectedFileName(fname)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedFileName === fname
                    ? 'bg-[#52796F] text-white shadow-xs'
                    : 'bg-[#F8F7F2] text-[#727873] hover:text-[#292F2D]'
                }`}
              >
                <FileText size={13} />
                <span>{fname}</span>
              </button>
            ))}
            {Object.keys(EXTENSION_ICONS_BASE64).map((iname) => (
              <button
                key={iname}
                onClick={() => setSelectedFileName(iname)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedFileName === iname
                    ? 'bg-[#52796F] text-white shadow-xs'
                    : 'bg-[#F8F7F2] text-[#727873] hover:text-[#292F2D]'
                }`}
              >
                <ImageIcon size={13} />
                <span>icons/{iname}</span>
              </button>
            ))}
          </div>

          {/* Selected File Details & Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8F7F2] p-3 rounded-xl border border-[#E5E3DA]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs sm:text-sm text-[#292F2D]">
                  {selectedFileName.startsWith('icon') ? `icons/${selectedFileName}` : selectedFileName}
                </span>
                <span className="text-[11px] text-[#727873]">
                  {EXTENSION_TEXT_FILES[selectedFileName]
                    ? `${(EXTENSION_TEXT_FILES[selectedFileName].length / 1024).toFixed(1)} KB`
                    : 'PNG Image'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {EXTENSION_TEXT_FILES[selectedFileName] && (
                  <button
                    onClick={() =>
                      handleCopyFileContent(
                        selectedFileName,
                        EXTENSION_TEXT_FILES[selectedFileName]
                      )
                    }
                    className="inline-flex items-center gap-1.5 text-xs bg-white hover:bg-[#CAD8C5] text-[#292F2D] border border-[#E5E3DA] px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    {copiedFile === selectedFileName ? (
                      <Check size={14} className="text-[#315C3B]" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span>{copiedFile === selectedFileName ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                )}

                <button
                  onClick={() => handleDownloadSingleFile(selectedFileName)}
                  className="inline-flex items-center gap-1.5 text-xs bg-[#52796F] hover:bg-[#354F52] text-white px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download This File</span>
                </button>
              </div>
            </div>

            {/* Code / Content Box */}
            {EXTENSION_TEXT_FILES[selectedFileName] ? (
              <div className="relative">
                <pre className="p-4 rounded-xl bg-[#292F2D] text-[#F8F7F2] font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed select-all">
                  <code>{EXTENSION_TEXT_FILES[selectedFileName]}</code>
                </pre>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA] flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-white border border-[#E5E3DA] flex items-center justify-center shadow-xs">
                  <img
                    src={`data:image/png;base64,${EXTENSION_ICONS_BASE64[selectedFileName]}`}
                    alt={selectedFileName}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <p className="text-xs text-[#727873]">
                  PNG Icon file ({selectedFileName}). Download and place in the <code className="bg-white px-1">icons/</code> subfolder.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: Interactive Simulator (Gmail & Toolbar) */}
      {activeViewMode === 'simulator' && (
        <div className="bg-white rounded-2xl border border-[#E5E3DA] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="border-b border-[#E5E3DA] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#292F2D] flex items-center gap-2">
                <Play size={20} className="text-[#52796F]" />
                Interactive Live Simulator
              </h2>
              <p className="text-xs sm:text-sm text-[#727873] mt-0.5">
                Preview how PhishCode AI looks and behaves directly inside Gmail and on your Chrome toolbar.
              </p>
            </div>

            <div className="flex rounded-lg bg-[#F8F7F2] p-1 border border-[#E5E3DA]">
              <button
                onClick={() => setSimMode('gmail')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  simMode === 'gmail' ? 'bg-white text-[#292F2D] shadow-xs' : 'text-[#727873]'
                }`}
              >
                <Mail size={14} />
                <span>In-Gmail Card View</span>
              </button>
              <button
                onClick={() => setSimMode('web')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  simMode === 'web' ? 'bg-white text-[#292F2D] shadow-xs' : 'text-[#727873]'
                }`}
              >
                <Chrome size={14} />
                <span>Toolbar Popup View</span>
              </button>
            </div>
          </div>

          {/* SIMULATOR: IN-GMAIL VIEW */}
          {simMode === 'gmail' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#F8F7F2] rounded-xl border border-[#E5E3DA]">
                <div className="text-xs font-semibold text-[#292F2D]">
                  Select Sample Email Scenario to Test:
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSimulatedEmail('phish')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      simulatedEmail === 'phish'
                        ? 'bg-[#8A3028] text-white'
                        : 'bg-white text-[#8A3028] border border-[#E8B4B0]'
                    }`}
                  >
                    🚨 Urgent PayPal Impersonation (High Risk)
                  </button>
                  <button
                    onClick={() => setSimulatedEmail('safe')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      simulatedEmail === 'safe'
                        ? 'bg-[#315C3B] text-white'
                        : 'bg-white text-[#315C3B] border border-[#CAD8C5]'
                    }`}
                  >
                    ✓ Legitimate GitHub Security Notice (Safe)
                  </button>
                </div>
              </div>

              {/* Simulated Gmail Message Frame */}
              <div className="rounded-2xl border-2 border-[#E5E3DA] overflow-hidden bg-white shadow-md">
                {/* Gmail Top Bar */}
                <div className="bg-[#F6F8FC] px-4 py-3 border-b border-[#E5E3DA] flex items-center justify-between text-xs text-[#727873]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#D93025] text-sm">M</span>
                    <span className="font-semibold text-[#292F2D]">mail.google.com</span>
                    <span>/ Inbox</span>
                  </div>
                  <span className="bg-[#DDEBDD] text-[#315C3B] px-2 py-0.5 rounded font-semibold text-[11px]">
                    PhishCode AI Extension Injected
                  </span>
                </div>

                {/* Email Subject */}
                <div className="px-6 py-4 border-b border-[#F0EFEA]">
                  <h3 className="text-lg font-bold text-[#292F2D]">
                    {simulatedEmail === 'phish'
                      ? 'URGENT: Unauthorized Transaction Detected - Account Suspended Within 24 Hours'
                      : 'Security alert: New sign-in to your GitHub account from Chrome on Windows'}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#727873]">
                    <div className="w-7 h-7 rounded-full bg-[#CAD8C5] text-[#292F2D] font-bold flex items-center justify-center text-xs">
                      {simulatedEmail === 'phish' ? 'P' : 'G'}
                    </div>
                    <div>
                      <span className="font-bold text-[#292F2D]">
                        {simulatedEmail === 'phish' ? 'PayPal Security Alert' : 'GitHub Support'}
                      </span>{' '}
                      &lt;
                      <span className="font-mono text-[#52796F]">
                        {simulatedEmail === 'phish'
                          ? 'security-alerts@paypal.verify-notice-center.xyz'
                          : 'support@github.com'}
                      </span>
                      &gt;
                    </div>
                  </div>
                </div>

                {/* INJECTED PHISHCODE AI BANNER CARD INSIDE GMAIL */}
                <div className="p-6 bg-[#FAF9F5] border-b border-[#E5E3DA]">
                  {simulatedEmail === 'phish' ? (
                    <div className="bg-white rounded-xl border border-[#E5E3DA] p-4 shadow-xs border-l-4 border-l-[#8A3028]">
                      <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🚨</span>
                          <span className="font-bold text-sm text-[#292F2D]">
                            PhishCode <strong className="text-[#52796F]">AI</strong>
                          </span>
                          <span className="text-[10px] font-bold bg-[#CAD8C5] text-[#292F2D] px-2 py-0.5 rounded uppercase">
                            Gmail Shield
                          </span>
                        </div>
                        <div className="bg-[#F3D8D4] text-[#8A3028] border border-[#E8B4B0] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <span>HIGH RISK</span>
                          <span>(95/100)</span>
                        </div>
                      </div>

                      <div className="text-xs text-[#292F2D] mt-3 font-medium">
                        High-confidence phishing indicators detected. Do not click links, reply with credentials, or download attachments.
                      </div>

                      <div className="mt-3">
                        <div className="text-[11px] font-bold uppercase text-[#727873]">Warning Signs Detected:</div>
                        <ul className="text-xs text-[#292F2D] space-y-1 mt-1">
                          <li>• <strong className="text-[#8A3028]">Sender spoofing:</strong> Claims to represent "PayPal", but sent from <code className="bg-[#F8F7F2] px-1 font-mono">@paypal.verify-notice-center.xyz</code></li>
                          <li>• <strong className="text-[#805B18]">High artificial urgency:</strong> "unauthorized transaction detected", "account suspended within 24 hours"</li>
                          <li>• <strong className="text-[#8A3028]">Requests sensitive credentials:</strong> Requests verification password and 2FA code</li>
                          <li>• <strong className="text-[#8A3028]">Hidden destination mismatch:</strong> Link text displays "www.paypal.com/restore" but directs to untrusted domain ending in <code className="bg-[#F8F7F2] px-1 font-mono">.xyz</code></li>
                        </ul>
                      </div>

                      <div className="mt-3 p-3 bg-[#F8F7F2] rounded-lg border border-[#E5E3DA] text-xs text-[#727873]">
                        🔒 <strong>Privacy Notice:</strong> Evaluated 100% locally in browser memory. No email content was sent to external servers.
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-[#E5E3DA] p-4 shadow-xs border-l-4 border-l-[#315C3B]">
                      <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🛡️</span>
                          <span className="font-bold text-sm text-[#292F2D]">
                            PhishCode <strong className="text-[#52796F]">AI</strong>
                          </span>
                          <span className="text-[10px] font-bold bg-[#CAD8C5] text-[#292F2D] px-2 py-0.5 rounded uppercase">
                            Gmail Shield
                          </span>
                        </div>
                        <div className="bg-[#DDEBDD] text-[#315C3B] border border-[#CAD8C5] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <span>SAFE-LOOKING</span>
                          <span>(10/100)</span>
                        </div>
                      </div>

                      <div className="text-xs text-[#292F2D] mt-3 font-medium">
                        Standard message hygiene observed. No blatant brand spoofing or known credential-theft signatures detected.
                      </div>

                      <div className="mt-3 p-2.5 rounded-lg bg-[#DDEBDD] border border-[#CAD8C5] text-xs text-[#315C3B] space-y-1">
                        <div>✓ Sender domain matches authentic GitHub infrastructure (@github.com)</div>
                        <div>✓ Inspected destination links point to legitimate domains</div>
                        <div>✓ No requests for passwords or payment credentials detected</div>
                      </div>

                      <div className="mt-3 p-3 bg-[#F8F7F2] rounded-lg border border-[#E5E3DA] text-xs text-[#727873]">
                        🔒 <strong>Privacy Notice:</strong> Evaluated 100% locally in browser memory. No email content was sent to external servers.
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Email Body */}
                <div className="p-6 text-xs text-[#292F2D] leading-relaxed">
                  {simulatedEmail === 'phish' ? (
                    <div className="space-y-3">
                      <p>Dear Customer,</p>
                      <p>
                        We detected an unauthorized transaction of $489.99 on your account. To prevent permanent suspension of your profile, immediate verification is required within 24 hours.
                      </p>
                      <p>
                        Please click the secure link below to confirm your password and 2FA code:
                      </p>
                      <p>
                        <a href="#demo" onClick={(e) => e.preventDefault()} className="text-blue-600 underline font-semibold">
                          https://www.paypal.com/restore-unauthorized-access-account
                        </a>
                      </p>
                      <p>Thank you for your cooperation,<br/>PayPal Security Verification Team</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p>Hi user,</p>
                      <p>
                        We noticed a new login to your GitHub account from Chrome on Windows. If this was you, you don't need to take any action.
                      </p>
                      <p>
                        If this wasn't you, please review your security log and update your credentials immediately at github.com/settings/security.
                      </p>
                      <p>Cheers,<br/>GitHub Team</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR: TOOLBAR POPUP VIEW */}
          {simMode === 'web' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Simulator Controls Left */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <h3 className="font-bold text-sm text-[#292F2D]">Select Test Website URL:</h3>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSimulatedUrl('https://paypal.com.verification-security-portal.xyz/login');
                      setSimState('idle');
                    }}
                    className="p-3 rounded-xl text-left border border-[#E5E3DA] hover:bg-[#F8F7F2] transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-[#8A3028]">
                      🚨 Brand Typosquatting (.xyz)
                    </div>
                    <div className="text-[11px] font-mono text-[#727873] truncate mt-0.5">
                      paypal.com.verification-security-portal.xyz
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSimulatedUrl('https://stanford.edu/academics/computer-science');
                      setSimState('idle');
                    }}
                    className="p-3 rounded-xl text-left border border-[#E5E3DA] hover:bg-[#F8F7F2] transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-[#315C3B]">
                      ✓ Authentic University (.edu)
                    </div>
                    <div className="text-[11px] font-mono text-[#727873] truncate mt-0.5">
                      stanford.edu/academics/computer-science
                    </div>
                  </button>
                </div>
              </div>

              {/* Popup Frame Right */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="w-[370px] bg-white rounded-2xl border-2 border-[#CAD8C5] shadow-2xl overflow-hidden flex flex-col">
                  {/* Toolbar Header */}
                  <div className="bg-[#E5E3DA] px-3 py-2 flex items-center justify-between border-b border-[#CAD8C5]/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8A3028]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#805B18]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#315C3B]" />
                    </div>
                    <div className="text-[10px] font-bold text-[#727873] flex items-center gap-1">
                      <span>Chrome Toolbar</span>
                      <div className="w-5 h-5 rounded bg-[#52796F] text-white flex items-center justify-center text-[10px]">
                        🛡️
                      </div>
                    </div>
                  </div>

                  {/* Extension Body */}
                  <div className="p-4 flex flex-col gap-3.5 bg-[#F8F7F2]">
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E5E3DA]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#52796F] text-white flex items-center justify-center font-bold text-sm">
                          🛡️
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#292F2D] leading-none">
                            PhishCode <span className="text-[#52796F]">AI</span>
                          </h4>
                          <p className="text-[10px] text-[#727873] mt-0.5">Gmail & Web Scanner</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold bg-[#F8F7F2] border border-[#E5E3DA] px-1.5 py-0.5 rounded text-[#727873]">
                        MV3
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-[#E5E3DA]">
                      <p className="text-[10px] font-bold uppercase text-[#727873]">Active Tab</p>
                      <p className="text-xs font-semibold text-[#292F2D] break-all mt-0.5 line-clamp-2">
                        {simulatedUrl}
                      </p>
                    </div>

                    {simState === 'idle' && (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={runSimulation}
                          className="w-full bg-[#52796F] hover:bg-[#354F52] text-white py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <span>🔍 Scan This Website</span>
                        </button>
                        <p className="text-[11px] text-[#727873] bg-white p-2.5 rounded-lg border border-[#E5E3DA] text-center">
                          🔒 <strong>Privacy:</strong> Reads active tab URL only. Zero passwords or cookies collected.
                        </p>
                      </div>
                    )}

                    {simState === 'loading' && (
                      <div className="bg-white p-6 rounded-xl border border-[#E5E3DA] flex flex-col items-center justify-center gap-2 text-center">
                        <div className="w-6 h-6 border-2 border-[#CAD8C5] border-t-[#52796F] rounded-full animate-spin" />
                        <p className="font-bold text-xs text-[#292F2D]">Scanning Website Heuristics...</p>
                      </div>
                    )}

                    {simState === 'result' && (
                      <div className="flex flex-col gap-2.5">
                        <div
                          className={`p-3 rounded-xl flex items-center justify-between font-bold text-xs ${
                            simulatedUrl.includes('xyz')
                              ? 'bg-[#F3D8D4] text-[#8A3028] border border-[#E8B4B0]'
                              : 'bg-[#DDEBDD] text-[#315C3B] border border-[#CAD8C5]'
                          }`}
                        >
                          <span>
                            {simulatedUrl.includes('xyz') ? 'HIGH RISK' : 'LOW RISK'}
                          </span>
                          <span>
                            {simulatedUrl.includes('xyz') ? '95 / 100' : '0 / 100'}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-[#E5E3DA] text-xs text-[#292F2D] leading-relaxed">
                          {simulatedUrl.includes('xyz') ? (
                            <div>
                              <strong className="text-[#8A3028]">Warning:</strong> Deceptive subdomain masquerades as "PayPal" on an unauthorized domain (<code className="bg-[#F8F7F2] px-1">.xyz</code>).
                            </div>
                          ) : (
                            <div>
                              <strong className="text-[#315C3B]">Clean:</strong> Recognized institutional domain extension (<code className="bg-[#F8F7F2] px-1">.edu</code>) with encrypted HTTPS.
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setSimState('idle')}
                          className="w-full bg-white hover:bg-[#F8F7F2] text-[#292F2D] border border-[#E5E3DA] py-2 rounded-lg font-semibold text-xs cursor-pointer"
                        >
                          Scan Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
