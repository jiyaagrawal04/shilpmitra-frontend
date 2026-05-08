import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useLocation } from 'react-router-dom';
import useAppStore from '../store/appStore';

const HIDDEN_PATHS = ['/', '/onboarding', '/about'];
const DEMO_USER_ID = '33f29c7a-34b8-4ea0-8a7b-25d323992b91';

export default function ChatAssistant() {
  const { t, lang } = useTranslation();
  const location = useLocation();
  const { currentUser } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  const isHidden = useMemo(() => HIDDEN_PATHS.includes(location.pathname), [location.pathname]);

  // Initialize greeting
  useEffect(() => {
    if (!initialized) {
      setMessages([{
        role: 'agent',
        text: lang === 'hi'
          ? 'नमस्ते! मैं ShilpMitra AI Agent हूँ। मैं सिर्फ बात नहीं करता — मैं आपके लिए काम करता हूँ! 🤖\n\nमैं कर सकता हूँ:\n• योजना पात्रता जाँचना ✅\n• लोन एप्लीकेशन PDF बनाना 🏦\n• ट्रेड रिकॉर्ड PDF बनाना 📄\n• ज़रूरी दस्तावेज़ बताना 📋\n\n🎤 आप बोलकर भी पूछ सकते हैं!'
          : 'Namaste! I\'m your ShilpMitra AI Agent. I don\'t just chat — I take actions! 🤖\n\nI can:\n• Check your scheme eligibility ✅\n• Generate loan application PDFs 🏦\n• Create trade record PDFs 📄\n• Tell you what documents you need 📋\n\n🎤 You can also speak to me!',
        time: new Date(),
        suggestedActions: [
          '✅ Check my eligibility',
          '📋 What documents do I need?',
          '📄 Generate trade record',
        ]
      }]);
      setInitialized(true);
    }
  }, [initialized, lang]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── TTS: Browser SpeechSynthesis (works everywhere) ────
  const speakText = useCallback((text, msgIndex) => {
    if (ttsPlaying === msgIndex) {
      window.speechSynthesis.cancel();
      setTtsPlaying(null);
      return;
    }
    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[•✅📄🏦📋🤖🎤📊💡📜🔈🔊❌]/g, '').replace(/\n+/g, '. ').substring(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set language
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (lang === 'kn') {
      utterance.lang = 'kn-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => setTtsPlaying(null);
    utterance.onerror = () => setTtsPlaying(null);

    setTtsPlaying(msgIndex);
    window.speechSynthesis.speak(utterance);
  }, [ttsPlaying, lang]);

  // ─── STT: Voice Input (Browser SpeechRecognition) ───────
  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'hi' ? 'आपका ब्राउज़र वॉइस इनपुट सपोर्ट नहीं करता' : 'Your browser doesn\'t support voice input');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
      setInput(transcript);
      if (event.results[0].isFinal) {
        setIsListening(false);
        // Auto-send after voice input
        setTimeout(() => {
          handleSend(transcript);
        }, 300);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, lang]);

  // ─── ACTION HANDLER ─────────────────────────────────────
  const handleAction = useCallback((actionText) => {
    setInput('');
    handleSend(actionText);
  }, []);

  if (isHidden) return null;

  // ─── SEND MESSAGE ───────────────────────────────────────
  const handleSend = async (overrideMsg) => {
    const userMsg = (overrideMsg || input).trim();
    if (!userMsg || loading) return;
    if (!overrideMsg) setInput('');

    setMessages(prev => [...prev, { role: 'user', text: userMsg, time: new Date() }]);
    setLoading(true);

    try {
      const userId = currentUser?.id || DEMO_USER_ID;
      const profile = {
        name: currentUser?.name || 'Raju Kumar',
        craft: currentUser?.craft_type || 'Pottery',
        location: currentUser?.location || 'Khurja, UP',
        totalSales: 81700,
        group: currentUser?.group_status || 'OBC',
      };

      let data;
      try {
        // Try Vercel agent endpoint
        const res = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, message: userMsg, language: lang, history: messages.slice(-6).map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })) }),
        });
        if (!res.ok) throw new Error('Agent unavailable');
        data = await res.json();
      } catch {
        // Fallback: client-side agent (localhost)
        const { runAgent } = await import('../lib/agentLocal.js');
        data = await runAgent(userMsg, profile, messages, lang);
      }

      const reply = lang === 'hi' ? (data.replyHi || data.reply) : data.reply;

      const agentMsg = {
        role: 'agent',
        text: reply || 'I processed your request.',
        time: new Date(),
        toolUsed: data.toolUsed,
        toolResult: data.toolResult,
        suggestedActions: data.suggestedActions || [],
        agentMode: data.agentMode,
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'agent',
        text: lang === 'hi'
          ? 'क्षमा करें, कनेक्शन में समस्या हुई। कृपया पुनः प्रयास करें।'
          : 'Sorry, connection error. Please try again.',
        time: new Date(),
        suggestedActions: ['✅ Check my eligibility', '📋 What documents do I need?'],
      }]);
    }
    setLoading(false);
  };

  // ─── TOOL BADGE ─────────────────────────────────────────
  const getToolBadge = (toolUsed) => {
    const badges = {
      check_eligibility: { icon: '✅', label: 'Checked Eligibility', color: '#27ae60' },
      generate_trade_record: { icon: '📄', label: 'Trade Record Generated', color: '#2980b9' },
      generate_loan_application: { icon: '🏦', label: 'Loan App Generated', color: '#8e44ad' },
      generate_eligibility_certificate: { icon: '📜', label: 'Certificate Generated', color: '#e67e22' },
      check_missing_documents: { icon: '📋', label: 'Doc Check Done', color: '#c0392b' },
      get_sales_summary: { icon: '📊', label: 'Sales Analyzed', color: '#16a085' },
      explain_scheme: { icon: '💡', label: 'Scheme Explained', color: '#f39c12' },
    };
    return badges[toolUsed] || null;
  };

  // ─── RENDER ─────────────────────────────────────────────
  return (
    <>
      {/* FAB */}
      <button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg hover:scale-95 transition-transform z-50 text-2xl"
        style={{ background: 'linear-gradient(135deg, #1F3C88, #3CCFCF)' }}>
        {isOpen ? '✕' : '🤖'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-48px)] h-[540px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50">

            {/* Header */}
            <div className="p-3.5 text-white flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #1F3C88, #4A90E2)' }}>
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg">🤖</div>
              <div className="flex-1">
                <h3 className="text-sm font-bold">ShilpMitra AI Agent</h3>
                <p className="text-[10px] text-white/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Autonomous Agent — Takes Actions
                </p>
              </div>
              <div className="text-[10px] bg-white/10 px-2 py-1 rounded-lg">
                {lang === 'hi' ? 'हिन्दी' : lang === 'kn' ? 'ಕನ್ನಡ' : 'EN'}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50">
              {messages.map((msg, i) => (
                <div key={i}>
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] px-3.5 py-2.5 text-[13px] leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-[#1F3C88] text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-slate-700 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm'}`}>

                      {/* Tool badge */}
                      {msg.toolUsed && msg.toolUsed !== 'none' && (() => {
                        const badge = getToolBadge(msg.toolUsed);
                        return badge ? (
                          <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                            style={{ background: `${badge.color}15`, color: badge.color, border: `1px solid ${badge.color}30` }}>
                            <span>{badge.icon}</span>
                            <span>{badge.label}</span>
                          </div>
                        ) : null;
                      })()}

                      {/* Message text */}
                      <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                      {/* TTS button */}
                      {msg.role === 'agent' && (
                        <button onClick={() => speakText(msg.text, i)}
                          className="mt-2 px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all"
                          style={{
                            background: ttsPlaying === i ? '#1F3C8815' : '#f1f5f9',
                            color: ttsPlaying === i ? '#1F3C88' : '#94a3b8',
                          }}>
                          <span className={ttsPlaying === i ? 'animate-pulse' : ''}>{ttsPlaying === i ? '🔊' : '🔈'}</span>
                          {ttsPlaying === i
                            ? (lang === 'hi' ? 'बंद करें' : 'Stop')
                            : (lang === 'hi' ? '🎧 सुनें' : '🎧 Listen')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Suggested Actions */}
                  {msg.suggestedActions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                      {msg.suggestedActions.map((action, j) => (
                        <button key={j}
                          onClick={() => handleAction(action)}
                          className="px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all hover:shadow-sm"
                          style={{ borderColor: '#1F3C8830', color: '#1F3C88', background: '#1F3C8808' }}>
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#1F3C88] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-[#4A90E2] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-[#3CCFCF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[11px] text-slate-400 animate-pulse">
                        {lang === 'hi' ? '🤖 Agent काम कर रहा है...' : '🤖 Agent working...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-100 bg-white">
              <div className="flex gap-2 items-center">
                {/* Mic Button */}
                <button onClick={toggleVoiceInput}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all shrink-0"
                  style={{
                    background: isListening ? '#ef4444' : '#f1f5f9',
                    color: isListening ? 'white' : '#64748b',
                    animation: isListening ? 'pulse 1s infinite' : 'none',
                  }}
                  title={lang === 'hi' ? 'बोलकर पूछें' : 'Speak to ask'}>
                  {isListening ? '⏹️' : '🎤'}
                </button>

                {/* Text Input */}
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening
                    ? (lang === 'hi' ? '🎤 बोलिए...' : '🎤 Listening...')
                    : (lang === 'hi' ? 'बोलें या टाइप करें...' : 'Speak or type...')}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 border border-slate-200 focus:border-[#4A90E2] focus:outline-none transition-colors" />

                {/* Send Button */}
                <button onClick={() => handleSend()} disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl text-white flex items-center justify-center disabled:opacity-40 transition-all text-lg shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1F3C88, #4A90E2)' }}>
                  →
                </button>
              </div>
              {isListening && (
                <div className="mt-1.5 text-center text-[10px] text-red-500 font-semibold animate-pulse">
                  🔴 {lang === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... speak now'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
