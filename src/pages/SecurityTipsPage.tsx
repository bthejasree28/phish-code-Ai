import React, { useState } from 'react';
import {
  BookOpen,
  Link2,
  Key,
  Smartphone,
  CreditCard,
  Briefcase,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const SecurityTipsPage: React.FC = () => {
  const [activeQuizQuestion, setActiveQuizQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const guides = [
    {
      title: '1. How to Identify Phishing Attempts',
      icon: <HelpCircle size={20} className="text-[#52796F]" />,
      summary: 'Learn the psychological triggers cybercriminals use to trick you into making rash decisions.',
      keyTakeaways: [
        'Artificial Urgency: Scammers set 12 to 24-hour deadlines to induce anxiety.',
        'Mismatched Display Names: An email display name says "Google Support", but the actual sender is "support@gmail-verify-login.xyz".',
        'Generic Salutations: "Dear Valued Customer" instead of your actual account username or legal name.',
        'Emotional Coercion: Threats of arrest, account termination, or missed lotteries.',
      ],
      practicalAdvice:
        'Always pause before clicking. If an email claims your account is locked, never use the link in the message. Open your web browser and navigate to the service yourself.',
    },
    {
      title: '2. How to Recognize Suspicious Links',
      icon: <Link2 size={20} className="text-[#52796F]" />,
      summary: 'Master the anatomy of web addresses so you can spot deceptive domains instantly.',
      keyTakeaways: [
        'The Root Domain Rule: Always look at the last two segments before the first forward slash. For instance, in "paypal.com.account-update.xyz/login", the real host is "account-update.xyz", NOT PayPal!',
        'Dangerous TLDs: Be cautious with cheap, disposable extensions like .xyz, .top, .cam, .zip, or .buzz.',
        'Punycode Attacks: Attackers substitute Cyrillic characters (like "а") that render identically to Latin letters.',
        'Raw IP Addresses: Legitimate consumer banks never use raw IP addresses (e.g., http://192.168.1.100).',
      ],
      practicalAdvice:
        'Hover over links on desktop before clicking, or long-press on mobile to inspect the actual destination URL.',
    },
    {
      title: '3. How to Protect Passwords & Credentials',
      icon: <Key size={20} className="text-[#52796F]" />,
      summary: 'Ditch short complex passwords for long memorable passphrases and modern password managers.',
      keyTakeaways: [
        'Length beats complexity: A 4-word passphrase like "velvet-orbit-harbor-quilt" is mathematically harder to crack than "P@ssw0rd1".',
        'Never reuse passwords: If one casual forum suffers a data breach, credential stuffing bots will try that combination everywhere.',
        'Use dedicated password managers: Bitwarden, 1Password, or Keychain automatically spot fake phishing domains and refuse to auto-fill.',
      ],
      practicalAdvice:
        'Enable Passkeys where available. Passkeys use cryptographic keys tied to the authentic domain and cannot be phished.',
    },
    {
      title: '4. Why OTPs (One-Time Passwords) Must Remain Private',
      icon: <Smartphone size={20} className="text-[#52796F]" />,
      summary: 'One-Time Passcodes are your final lock. Never read them out or forward them.',
      keyTakeaways: [
        'No bank or courier ever asks for an OTP: SMS codes are strictly for YOUR eyes to confirm an action YOU initiated.',
        'The "I sent a code to your phone by mistake" scam: An attacker is attempting to reset your password and asks you for the code.',
        'Prefer Authenticator Apps: Authenticator apps (Google Authenticator, Microsoft Authenticator) do not suffer from SIM-swapping.',
      ],
      practicalAdvice:
        'If someone asks you for a 6-digit code received via SMS, hang up immediately and lock that account.',
    },
    {
      title: '5. How to Identify Fake Payment Requests',
      icon: <CreditCard size={20} className="text-[#52796F]" />,
      summary: 'Recognize payment diversion scams, gift card demands, and fraudulent invoices.',
      keyTakeaways: [
        'Gift Cards are for gifts, NOT payments: Government agencies (IRS, police) never accept payment via Apple, Google Play, or Steam cards.',
        'Wire transfer / Zelle pressure: Scammers urge non-reversible payment methods before you realize the fraud.',
        'Fake Invoice Attachments: Emails claiming you bought $899 GeekSquad or McAfee software with a "dispute" phone number.',
      ],
      practicalAdvice:
        'Verify invoice requests with vendors through an independent phone number you obtained previously, not the number on the invoice.',
    },
    {
      title: '6. How to Avoid Fraudulent Job Offers',
      icon: <Briefcase size={20} className="text-[#52796F]" />,
      summary: 'Guard against task-based remote work scams and unsolicited recruiters on messaging apps.',
      keyTakeaways: [
        'Unsolicited WhatsApp / Telegram recruiters: Reputable employers do not cold-recruit via anonymous chat apps.',
        'Too good to be true: Promising $300 to $800 daily for 20 minutes of "rating apps" or "clicking hotel reviews".',
        'Upfront "deposit" required: If a job asks you to deposit crypto or wire funds to "unlock higher tasks", it is 100% a scam.',
      ],
      practicalAdvice:
        'Always research companies on official careers portals, LinkedIn, and corporate websites before engaging.',
    },
    {
      title: '7. How to Use the PhishCode AI Bookmarklet',
      icon: <Bookmark size={20} className="text-[#52796F]" />,
      summary: 'Understand the lightweight, privacy-preserving browser protection tool.',
      keyTakeaways: [
        'On-Demand, Not Continuous: You control when it runs by clicking your bookmark.',
        'Zero Privacy Intrusions: Never touches your cookies, passwords, or background traffic.',
        'One-Click Verification: Opens PhishCode AI in a separate tab with the URL pre-analyzed by our heuristic scanner.',
      ],
      practicalAdvice:
        'Keep the bookmark on your browser toolbar so you can check unknown shopping sites or links before entering card info.',
    },
  ];

  // Interactive Quiz
  const quizQuestions = [
    {
      question: 'You receive an email from "PayPal Security" with the link: https://paypal.com.verify-login.xyz. Is this safe?',
      options: [
        'Yes, because it starts with paypal.com.',
        'No, because the registered root domain is actually verify-login.xyz.',
        'Yes, because it uses HTTPS.',
        'Yes, if you check it on mobile.',
      ],
      correct: 1,
      explanation: 'Always inspect the root domain before the first slash. Here the actual domain is verify-login.xyz, impersonating PayPal!',
    },
    {
      question: 'Someone calls claiming to be from your bank and asks you to read out a 6-digit text message code. What should you do?',
      options: [
        'Read the code so they can verify your account.',
        'Hang up immediately; banks never ask for your one-time SMS verification code.',
        'Ask them to email you the code first.',
        'Give them only the first 3 digits.',
      ],
      correct: 1,
      explanation: 'One-Time Passcodes (OTPs) should never be shared with anyone, even someone claiming to represent your bank or support.',
    },
    {
      question: 'Which of the following is considered the strongest password strategy?',
      options: [
        'A short 8-character password with many special symbols (e.g. Tr#9!qZ).',
        'A memorable 4-word unique passphrase stored in a password manager (e.g. orbit-velvet-copper-harbor).',
        'Your birthdate followed by exclamation marks.',
        'Reusing the same strong password across all accounts.',
      ],
      correct: 1,
      explanation: 'Length combined with uniqueness provides the greatest mathematical resistance to brute-force cracking.',
    },
  ];

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score++;
    });
    return score;
  };

  return (
    <div className="flex flex-col gap-10 py-6 max-w-4xl mx-auto w-full">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#CAD8C5] text-[#292F2D] flex items-center justify-center">
            <BookOpen size={18} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#292F2D] tracking-tight">
            Cybersecurity Awareness Hub
          </h1>
        </div>
        <p className="text-sm text-[#727873] mt-1.5">
          Essential digital self-defense principles explained in plain English for everyday internet users.
        </p>
      </div>

      {/* Guide Accordions */}
      <div className="flex flex-col gap-4">
        {guides.map((guide, idx) => {
          const isExpanded = expandedSection === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#E5E3DA] overflow-hidden transition-all shadow-xs"
            >
              <button
                onClick={() => setExpandedSection(isExpanded ? null : idx)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-[#F8F7F2] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#F8F7F2] border border-[#E5E3DA] flex items-center justify-center shrink-0">
                    {guide.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#292F2D]">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-[#727873] mt-0.5">{guide.summary}</p>
                  </div>
                </div>

                <div className="text-[#727873] pl-2">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-[#E5E3DA] bg-white flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#52796F] mb-2">
                      Key Warning Signs
                    </h4>
                    <ul className="space-y-2">
                      {guide.keyTakeaways.map((point, pIdx) => (
                        <li key={pIdx} className="text-xs sm:text-sm text-[#292F2D] flex items-start gap-2.5">
                          <CheckCircle2 size={16} className="text-[#315C3B] shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#DDEBDD] border border-[#CAD8C5] text-xs sm:text-sm text-[#315C3B] leading-relaxed">
                    <strong>Actionable Golden Rule:</strong> {guide.practicalAdvice}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Hackathon Knowledge Quiz */}
      <div className="bg-white rounded-2xl border border-[#E5E3DA] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E3DA]">
          <div className="w-10 h-10 rounded-xl bg-[#F5E6C8] border border-[#E6C77A] text-[#805B18] flex items-center justify-center">
            <Award size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#292F2D]">Test Your Phishing Detection IQ</h2>
            <p className="text-xs text-[#727873]">Quick 3-question practical check for hackathon judges & students.</p>
          </div>
        </div>

        <div className="space-y-6">
          {quizQuestions.map((q, qIdx) => {
            const hasAnswered = selectedAnswers[qIdx] !== undefined;
            const chosen = selectedAnswers[qIdx];
            const isCorrect = chosen === q.correct;

            return (
              <div key={qIdx} className="p-4 sm:p-5 rounded-xl bg-[#F8F7F2] border border-[#E5E3DA] flex flex-col gap-3">
                <p className="font-semibold text-sm text-[#292F2D]">
                  {qIdx + 1}. {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = chosen === oIdx;
                    let btnStyle = 'bg-white hover:bg-[#E5E3DA] border-[#E5E3DA] text-[#292F2D]';

                    if (hasAnswered) {
                      if (oIdx === q.correct) {
                        btnStyle = 'bg-[#DDEBDD] border-[#CAD8C5] text-[#315C3B] font-semibold';
                      } else if (isSelected) {
                        btnStyle = 'bg-[#F3D8D4] border-[#E8B4B0] text-[#8A3028]';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={hasAnswered}
                        onClick={() => handleSelectOption(qIdx, oIdx)}
                        className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle} cursor-pointer`}
                      >
                        <span>{opt}</span>
                        {hasAnswered && oIdx === q.correct && (
                          <span className="text-xs font-bold text-[#315C3B]">✓ Correct</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {hasAnswered && (
                  <div className="text-xs text-[#727873] pt-2 border-t border-[#E5E3DA]">
                    <strong className="text-[#292F2D]">Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {Object.keys(selectedAnswers).length === quizQuestions.length && (
          <div className="p-4 rounded-xl bg-[#DDEBDD] border border-[#CAD8C5] text-center flex flex-col items-center gap-2">
            <h3 className="font-bold text-base text-[#315C3B]">
              Quiz Completed! Score: {calculateScore()} / {quizQuestions.length}
            </h3>
            <p className="text-xs text-[#315C3B]">
              {calculateScore() === quizQuestions.length
                ? 'Outstanding! You have sharp threat-detection reflexes.'
                : 'Great effort! Review the guides above to sharpen your cybersecurity radar.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
