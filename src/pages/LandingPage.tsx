import React from 'react';
import { TabType } from '../types';
import {
  Shield,
  Link2,
  Mail,
  MessageSquareWarning,
  Bookmark,
  Chrome,
  CheckCircle2,
  Lock,
  Search,
  Bot,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  Sliders,
  BookOpen,
} from 'lucide-react';

interface Props {
  onSelectTab: (tab: TabType) => void;
}

export const LandingPage: React.FC<Props> = ({ onSelectTab }) => {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="bg-white rounded-2xl border border-[#E5E3DA] p-8 md:p-12 shadow-xs">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DDEBDD] text-[#315C3B] text-xs font-semibold border border-[#CAD8C5]">
            <ShieldCheck size={16} />
            <span>Built for College Hackathon • Digital Safety for Everyone</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#292F2D] tracking-tight leading-tight">
            Stop Phishing and Online Scams Before They Strike
          </h1>

          <p className="text-base sm:text-lg text-[#727873] leading-relaxed max-w-2xl">
            PhishCode AI is a trustworthy, human-centered cybersecurity platform designed to help students,
            families, and everyday internet users verify suspicious links, deceptive emails, and fraudulent messages in seconds.
          </p>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full pt-4">
            <button
              onClick={() => onSelectTab('url-scanner')}
              className="flex items-center justify-center gap-2.5 bg-[#52796F] hover:bg-[#354F52] text-white px-5 py-3.5 rounded-xl font-medium transition-all shadow-xs cursor-pointer"
            >
              <Link2 size={18} />
              <span>Check a Link</span>
            </button>

            <button
              onClick={() => onSelectTab('email-analyzer')}
              className="flex items-center justify-center gap-2.5 bg-[#52796F] hover:bg-[#354F52] text-white px-5 py-3.5 rounded-xl font-medium transition-all shadow-xs cursor-pointer"
            >
              <Mail size={18} />
              <span>Analyze an Email</span>
            </button>

            <button
              onClick={() => onSelectTab('message-checker')}
              className="flex items-center justify-center gap-2.5 bg-[#52796F] hover:bg-[#354F52] text-white px-5 py-3.5 rounded-xl font-medium transition-all shadow-xs cursor-pointer"
            >
              <MessageSquareWarning size={18} />
              <span>Check a Message</span>
            </button>

            <button
              onClick={() => onSelectTab('chrome-extension')}
              className="flex items-center justify-center gap-2.5 bg-[#F8F7F2] hover:bg-[#CAD8C5] text-[#292F2D] border border-[#52796F] px-5 py-3.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              <Chrome size={18} className="text-[#52796F]" />
              <span>Chrome Extension (MV3)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-[#727873]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#315C3B]" /> Lightweight & fast
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={14} className="text-[#315C3B]" /> Privacy first — zero data harvesting
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} className="text-[#315C3B]" /> No background browser extensions
            </span>
          </div>
        </div>
      </section>

      {/* How PhishCode AI Works */}
      <section className="flex flex-col gap-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#292F2D] tracking-tight">How PhishCode AI Protects You</h2>
          <p className="text-sm text-[#727873] mt-2">
            Multi-layered defense combining structural inspection, pattern intelligence, and conversational assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E5E3DA] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA] text-[#52796F] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-semibold text-base text-[#292F2D]">Inspect</h3>
            <p className="text-xs sm:text-sm text-[#727873] leading-relaxed">
              Paste any URL, email body, or direct message, or trigger our one-click browser bookmarklet on any open tab.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E3DA] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA] text-[#52796F] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-semibold text-base text-[#292F2D]">Deconstruct</h3>
            <p className="text-xs sm:text-sm text-[#727873] leading-relaxed">
              Our heuristic engine evaluates protocol security, IP hosts, deceptive subdomains, urgency triggers, and OTP requests.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E3DA] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA] text-[#52796F] flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-semibold text-base text-[#292F2D]">Classify</h3>
            <p className="text-xs sm:text-sm text-[#727873] leading-relaxed">
              Receive a calm, color-coded score: Low Risk (soft green), Suspicious Warning (warm amber), or High Risk (coral).
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E3DA] flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA] text-[#52796F] flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-semibold text-base text-[#292F2D]">Guide</h3>
            <p className="text-xs sm:text-sm text-[#727873] leading-relaxed">
              Read step-by-step practical advice on what to do next, or ask our AI Cybersecurity Assistant for deeper guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E3DA] p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#DDEBDD] text-[#315C3B] flex items-center justify-center">
              <Link2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#292F2D]">Deep URL Phishing Analysis</h3>
            <p className="text-sm text-[#727873] leading-relaxed">
              Detects brand typosquatting, raw IP hosts, suspicious TLDs (.xyz, .top, .zip), excessive subdomains, and obfuscated character encoding.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('url-scanner')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#52796F] hover:text-[#354F52] pt-2"
          >
            Launch URL Scanner <ArrowRight size={16} />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E3DA] p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F5E6C8] text-[#805B18] border border-[#E6C77A] flex items-center justify-center">
              <Mail size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#292F2D]">Email & Smishing Scrutiny</h3>
            <p className="text-sm text-[#727873] leading-relaxed">
              Flags manufactured urgency ("Account suspended in 24h"), credential harvesting, unexpected invoices, fake parcel deliveries, and OTP theft.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('email-analyzer')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#52796F] hover:text-[#354F52] pt-2"
          >
            Launch Email Analyzer <ArrowRight size={16} />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E3DA] p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F8F7F2] text-[#52796F] border border-[#CAD8C5] flex items-center justify-center">
              <Chrome size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#292F2D]">Google Chrome Extension</h3>
            <p className="text-sm text-[#727873] leading-relaxed">
              Real Manifest V3 toolbar extension. Pin to your browser, click "Scan This Website", and analyze the active tab with privacy-first activeTab permissions.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('chrome-extension')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#52796F] hover:text-[#354F52] pt-2"
          >
            Get Extension & Guide <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Cybersecurity Awareness Preview Banner */}
      <section className="bg-white rounded-2xl border border-[#E5E3DA] p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-3 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#52796F]">
            <BookOpen size={16} /> Security Education Hub
          </div>
          <h3 className="text-2xl font-bold text-[#292F2D] tracking-tight">
            Knowledge is Your Strongest Firewall
          </h3>
          <p className="text-sm text-[#727873] leading-relaxed">
            Technology stops the obvious, but understanding attacker tactics protects you from the rest.
            Explore our curated guides on recognizing deceptive links, protecting OTPs, and avoiding financial traps.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            onClick={() => onSelectTab('security-tips')}
            className="bg-[#52796F] hover:bg-[#354F52] text-white px-5 py-3 rounded-xl font-medium text-sm transition-colors text-center"
          >
            Explore Security Guides
          </button>
          <button
            onClick={() => onSelectTab('ai-assistant')}
            className="bg-[#F8F7F2] hover:bg-[#E5E3DA] text-[#292F2D] border border-[#E5E3DA] px-5 py-3 rounded-xl font-medium text-sm transition-colors text-center"
          >
            Ask AI Assistant
          </button>
        </div>
      </section>
    </div>
  );
};
