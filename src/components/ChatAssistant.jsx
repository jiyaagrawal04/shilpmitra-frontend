import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useLocation } from 'react-router-dom';
import useAppStore from '../store/appStore';
import { chatWithGemini } from '../lib/geminiApi';

export default function ChatAssistant() {
  const { t, lang } = useTranslation();
  const location = useLocation();
  const { currentUser } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize greeting after first render
  useEffect(() => {
    if (!initialized) {
      setMessages([{
        role: 'ai',
        text: lang === 'hi' ? 'नमस्ते! मैं आपका शिल्पमित्र AI सहायक हूँ।' : 'Namaste! I\'m your ShilpMitra AI assistant. How can I help?',
        time: new Date()
      }]);
      setInitialized(true);
    }
  }, [initialized, lang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Hide on certain pages
  const hiddenPaths = ['/', '/onboarding', '/about'];
  if (hiddenPaths.includes(location.pathname)) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time: new Date() }]);
    setLoading(true);
    try {
      const profile = { name: currentUser.name, craft: currentUser.craft, location: currentUser.location, totalSales: 81700 };
      const result = await chatWithGemini(userMsg, profile, messages);
      const reply = lang === 'hi' ? (result.replyHi || result.reply) : result.reply;
      setMessages(prev => [...prev, { role: 'ai', text: reply, time: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.', time: new Date() }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* FAB */}
      <button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1F3C88] to-[#3CCFCF] text-white flex items-center justify-center shadow-lg hover:scale-95 transition-transform z-50 text-2xl">
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-48px)] h-[480px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50">
            
            {/* Header */}
            <div className="p-4 text-white flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #1F3C88, #4A90E2)' }}>
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg">🤖</div>
              <div>
                <h3 className="text-sm font-bold">{lang === 'hi' ? 'शिल्पमित्र AI' : 'ShilpMitra AI'}</h3>
                <p className="text-[10px] text-white/60">AI Assistant</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-[#1F3C88] text-white rounded-2xl rounded-br-md'
                      : 'bg-white text-slate-700 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-400 px-4 py-3 rounded-2xl rounded-bl-md border border-slate-100">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={lang === 'hi' ? 'योजनाओं के बारे में पूछें...' : 'Ask about schemes, sales...'}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 border border-slate-200 focus:border-[#4A90E2] focus:outline-none transition-colors" />
                <button onClick={handleSend} disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-[#1F3C88] text-white flex items-center justify-center hover:bg-[#4A90E2] disabled:opacity-40 transition-all text-lg">
                  →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
