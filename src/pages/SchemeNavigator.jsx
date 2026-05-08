import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { schemes, eligibilityChecks, artisans, transactions } from '../data/demoData';
import { chatWithGemini, explainScheme } from '../lib/geminiApi';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function SchemeNavigator() {
  const [showDocs, setShowDocs] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text: 'Namaste! I am your ShilpMitra AI assistant. Ask me about government schemes, loans, or your eligibility — in Hindi or English!',
      textHi: 'नमस्ते! मैं आपका ShilpMitra AI सहायक हूँ। सरकारी योजनाओं, ऋण या पात्रता के बारे में पूछें — हिंदी या अंग्रेजी में!',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const matched = schemes.slice(0, 2);
  const artisan = artisans[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    const msg = userInput.trim();
    if (!msg || isLoading) return;

    const newUserMsg = { role: 'user', text: msg };
    setChatMessages((prev) => [...prev, newUserMsg]);
    setUserInput('');
    setIsLoading(true);

    try {
      // Pass full conversation history so Gemini has context
      const history = [...chatMessages, newUserMsg];
      const result = await chatWithGemini(
        msg,
        { name: artisan.name, craft: artisan.craft, location: artisan.location, totalSales: artisan.totalSales },
        history
      );

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: result.reply || 'I could not generate a response. Please try again.',
          textHi: result.replyHi || '',
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainScheme = async (schemeName) => {
    setIsLoading(true);
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: `Explain ${schemeName} to me` },
    ]);

    try {
      const result = await explainScheme(schemeName, 'hi');
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: result.text, textHi: result.textHi },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, could not fetch explanation. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} className="page-container space-y-lg pb-8">
      {/* AI Chat Section */}
      <motion.section variants={fadeUp} className="bg-surface-container-low rounded-xl p-md shadow-ambient border border-outline-variant/30 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-md border-b border-outline-variant/30 pb-sm">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container filled text-[18px]">smart_toy</span>
          </div>
          <h3 className="section-title">AI Scheme Assistant</h3>
          <span className="chip bg-primary-fixed/50 text-primary ml-auto">Gemini</span>
        </div>

        {/* Chat Messages */}
        <div className="max-h-[300px] overflow-y-auto hide-scrollbar space-y-md">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container filled">smart_toy</span>
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl p-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-on-primary rounded-br-sm'
                  : 'bg-surface-container rounded-bl-sm'
              }`}>
                <p className={`font-body-md text-body-md ${msg.role === 'user' ? '' : 'text-on-surface'}`}>{msg.text}</p>
                {msg.textHi && (
                  <p className={`font-body-md text-body-md mt-1 italic ${msg.role === 'user' ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                    {msg.textHi}
                  </p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-on-primary-container filled animate-pulse">smart_toy</span>
              </div>
              <div className="bg-surface-container rounded-2xl rounded-bl-sm p-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="flex gap-2 mt-md pt-sm border-t border-outline-variant/30">
          <input
            className="input-field flex-1 h-[48px]"
            placeholder="Ask about schemes... / योजनाओं के बारे में पूछें..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className="w-12 h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </motion.section>

      {/* Scheme Cards */}
      <motion.section variants={fadeUp}>
        <h2 className="section-title mb-4">Eligible Schemes</h2>
        <div className="grid grid-cols-1 gap-4">
          {matched.map((scheme) => (
            <div key={scheme.id} className="card p-md flex flex-col justify-between relative overflow-hidden group hover:shadow-ambient-sm transition-shadow">
              <div className="absolute top-0 right-0 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-bl-xl font-label-caps text-label-caps flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> Match Found
              </div>
              <div>
                <h3 className="font-h3-title text-h3-title text-primary mb-2 mt-4">{scheme.name}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-2">{scheme.description}</p>
                <p className="font-label-caps text-label-caps text-primary mb-4">Up to ₹{(scheme.fundingLimit / 100000).toFixed(0)} Lakh</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-outline flex-1">
                  Apply Now <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                <button
                  onClick={() => handleExplainScheme(scheme.name)}
                  className="px-4 py-3 rounded-lg border border-outline-variant text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-high transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">info</span> Explain
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* More Schemes */}
      <motion.section variants={fadeUp}>
        <h2 className="section-title mb-4">Other Schemes</h2>
        <div className="space-y-3">
          {schemes.slice(2).map((scheme) => (
            <div key={scheme.id} className="card p-md flex items-center justify-between">
              <div>
                <h3 className="font-body-md text-body-md font-semibold text-on-surface">{scheme.name}</h3>
                <p className="font-label-caps text-label-caps text-on-surface-variant">{scheme.nameHi} • Up to ₹{(scheme.fundingLimit / 100000).toFixed(0)}L</p>
              </div>
              <button
                onClick={() => handleExplainScheme(scheme.name)}
                className="p-2 text-primary hover:bg-surface-variant rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Eligibility Checklist */}
      <motion.section variants={fadeUp} className="card p-md">
        <h2 className="section-title mb-4">Eligibility Checklist</h2>
        <ul className="space-y-3">
          {eligibilityChecks.map((check) => (
            <li key={check.id} className={`flex items-center gap-4 bg-surface-container-low p-3 rounded-lg ${check.status === 'amber' ? 'border border-secondary-container' : check.status === 'red' ? 'border border-error/30' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                check.status === 'green' ? 'bg-[#e8f5e9]' : check.status === 'amber' ? 'bg-secondary-fixed' : 'bg-error-container'
              }`}>
                <span className={`material-symbols-outlined ${
                  check.status === 'green' ? 'text-[#2e7d32]' : check.status === 'amber' ? 'text-on-secondary-container' : 'text-error'
                }`}>{check.status === 'green' ? 'check' : check.status === 'amber' ? 'warning' : 'close'}</span>
              </div>
              <div className="flex-1">
                <span className="font-body-md text-body-md text-on-surface block">{check.label}</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">{check.detail}</span>
              </div>
              {check.status !== 'green' && (
                <button className="p-2 text-primary hover:bg-surface-variant rounded-full transition-colors">
                  <span className="material-symbols-outlined">upload_file</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </motion.section>
    </motion.div>
  );
}
