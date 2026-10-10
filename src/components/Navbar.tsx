import React, { useState } from 'react';
import { TabType } from '../types';
import {
  Shield,
  LayoutDashboard,
  Link2,
  Mail,
  MessageSquareWarning,
  Bot,
  Chrome,
  Bookmark,
  BookOpen,
  History,
  Menu,
  X,
} from 'lucide-react';

interface Props {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  scanCount: number;
}

export const Navbar: React.FC<Props> = ({ currentTab, onSelectTab, scanCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Shield size={18} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'url-scanner', label: 'URL Scanner', icon: <Link2 size={18} /> },
    { id: 'email-analyzer', label: 'Email Analyzer', icon: <Mail size={18} /> },
    { id: 'message-checker', label: 'Scam Message', icon: <MessageSquareWarning size={18} /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <Bot size={18} /> },
    {
      id: 'chrome-extension',
      label: 'Chrome Extension',
      icon: <Chrome size={18} />,
      badge: 'MV3',
    },
    { id: 'security-tips', label: 'Security Tips', icon: <BookOpen size={18} /> },
    {
      id: 'history',
      label: 'Scan History',
      icon: <History size={18} />,
      badge: scanCount > 0 ? String(scanCount) : undefined,
    },
  ];

  const handleSelect = (tab: TabType) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E5E3DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => handleSelect('home')}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52796F] rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-[#52796F] text-white flex items-center justify-center shadow-xs">
              <Shield size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-[#292F2D] tracking-tight">
                  PhishCode <span className="text-[#52796F]">AI</span>
                </span>
                <span className="text-[10px] font-semibold uppercase bg-[#CAD8C5] text-[#292F2D] px-1.5 py-0.5 rounded">
                  Hackathon
                </span>
              </div>
              <p className="text-[11px] text-[#727873] leading-none">Trustworthy Cybersecurity</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F8F7F2] text-[#52796F] font-semibold border border-[#E5E3DA]'
                      : 'text-[#727873] hover:text-[#292F2D] hover:bg-[#F8F7F2]'
                  }`}
                >
                  <span className={isActive ? 'text-[#52796F]' : 'text-[#727873]'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                        item.id === 'chrome-extension'
                          ? 'bg-[#DDEBDD] text-[#315C3B] border border-[#CAD8C5]'
                          : 'bg-[#E5E3DA] text-[#292F2D]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile hamburger button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#727873] hover:text-[#292F2D] hover:bg-[#F8F7F2] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E5E3DA] px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F8F7F2] text-[#52796F] font-semibold border border-[#E5E3DA]'
                    : 'text-[#727873] hover:text-[#292F2D] hover:bg-[#F8F7F2]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#52796F]' : 'text-[#727873]'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.id === 'chrome-extension'
                        ? 'bg-[#DDEBDD] text-[#315C3B]'
                        : 'bg-[#E5E3DA] text-[#292F2D]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
