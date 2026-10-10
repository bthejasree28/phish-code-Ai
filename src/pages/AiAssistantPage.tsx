import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import {
  Bot,
  Send,
  User,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

export const AiAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I am your PhishCode AI Cybersecurity Assistant. 

I'm here to help you understand online threats, spot social engineering tricks, strengthen your passwords, and protect your digital accounts.

You can ask me questions about suspicious emails, SMS smishing, banking alerts, or safe browsing practices. What's on your mind?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    setInputValue('');
    setApiWarning(null);

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: newHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: 'reply-' + Date.now(),
        role: 'model',
        text: data.reply || 'No response generated. Please ask another question.',
        timestamp: Date.now(),
        source: data.source,
        warning: data.warning || data.note,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (data.warning) {
        setApiWarning(data.warning);
      }
    } catch (err: any) {
      console.warn('Chat API error:', err);
      // Fallback message so user never sees a hard crash
      const fallbackMsg: ChatMessage = {
        id: 'reply-err-' + Date.now(),
        role: 'model',
        text: `**Security Guidance Notice**\n\nI was temporarily unable to connect to the cloud AI service, but here is fundamental security guidance for your question:\n\n• If you are currently dealing with a suspicious link or text, do NOT interact with it.\n• Never disclose your password, PIN, or SMS verification code to anyone.\n• If financial credentials or bank cards were exposed, call your financial institution immediately using the phone number printed on the back of your card.`,
        timestamp: Date.now(),
        source: 'local_fallback',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setApiWarning('Operating in local guidance mode due to temporary network connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text: 'Chat history cleared. How can I assist with your cybersecurity questions today?',
        timestamp: Date.now(),
      },
    ]);
    setApiWarning(null);
  };

  const suggestedQuestions = [
    'How do I tell if an SMS from my bank is authentic?',
    'What should I do right away if I clicked a suspicious link?',
    'Why is an authenticator app safer than SMS for 2FA?',
    'How do attackers disguise URLs using lookalike domains?',
    'How do I spot task-based job scams on WhatsApp or Telegram?',
  ];

  return (
    <div className="flex flex-col gap-6 py-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#CAD8C5] text-[#292F2D] flex items-center justify-center">
              <Bot size={18} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#292F2D] tracking-tight">
              AI Cybersecurity Assistant
            </h1>
          </div>
          <p className="text-sm text-[#727873] mt-1">
            Get practical advice on phishing, malware defense, password health, and fraud prevention.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="inline-flex items-center gap-1.5 text-xs text-[#727873] hover:text-[#292F2D] bg-white border border-[#E5E3DA] px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw size={14} /> Clear Chat
        </button>
      </div>

      {apiWarning && (
        <div className="p-3 rounded-lg bg-[#F5E6C8] border border-[#E6C77A] text-[#805B18] text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{apiWarning}</span>
        </div>
      )}

      {/* Chat Messages Panel */}
      <div className="bg-white rounded-2xl border border-[#E5E3DA] shadow-xs flex flex-col h-[520px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                    isUser
                      ? 'bg-[#52796F] text-white'
                      : 'bg-[#F8F7F2] text-[#292F2D] border border-[#E5E3DA]'
                  }`}
                >
                  {isUser ? <User size={15} /> : <Bot size={15} />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#52796F] text-white rounded-tr-xs'
                      : 'bg-[#F8F7F2] text-[#292F2D] border border-[#E5E3DA] rounded-tl-xs'
                  }`}
                >
                  {m.text}
                  {m.source && !isUser && (
                    <div className="mt-2 pt-2 border-t border-[#E5E3DA]/60 flex items-center gap-1.5 text-[10px] text-[#727873]">
                      <Sparkles size={11} className="text-[#52796F]" />
                      <span>Powered by {m.source === 'gemini' ? 'Gemini 3.8 Flash' : 'PhishCode Knowledgebase'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F8F7F2] text-[#292F2D] border border-[#E5E3DA] flex items-center justify-center text-xs">
                <Bot size={15} />
              </div>
              <div className="bg-[#F8F7F2] text-[#727873] border border-[#E5E3DA] rounded-2xl rounded-tl-xs p-4 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#52796F] animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-[#52796F] animate-pulse delay-100" />
                <div className="w-2 h-2 rounded-full bg-[#52796F] animate-pulse delay-200" />
                <span className="text-xs ml-1">Analyzing security context...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-t border-[#E5E3DA] bg-[#F8F7F2]/50 flex gap-2 overflow-x-auto no-scrollbar">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-[#CAD8C5] text-[#292F2D] border border-[#E5E3DA] px-2.5 py-1 rounded-full transition-colors shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#E5E3DA] bg-white rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask any cybersecurity question (e.g. 'Someone asked for my OTP code...')"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-[#F8F7F2] border border-[#E5E3DA] focus:border-[#52796F] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-[#292F2D] placeholder-[#727873]/60 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-[#52796F] hover:bg-[#354F52] disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-sm font-medium transition-colors shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="bg-[#F8F7F2] border border-[#E5E3DA] p-3.5 rounded-xl text-xs text-[#727873] leading-relaxed flex items-start gap-2.5">
        <ShieldAlert size={16} className="text-[#52796F] shrink-0 mt-0.5" />
        <p>
          <strong>Security Notice:</strong> The AI Assistant offers security education and advisory triage.
          It does not provide legally binding security verdicts. Never paste real passwords, credit card numbers, or sensitive corporate tokens into chat.
        </p>
      </div>
    </div>
  );
};
