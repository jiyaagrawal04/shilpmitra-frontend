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
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const isHidden = useMemo(() => HIDDEN_PATHS.includes(location.pathname), [location.pathname]);

  useEffect(() => {
    if (!initialized) {
      setMessages([{
        role: 'agent',
        text: lang === 'hi'
          ? 'नमस्ते! मैं ShilpMitra AI Agent हूँ। मैं सिर्फ बात नहीं करता — मैं आपके लिए काम करता हूँ! 🤖\n\nमैं कर सकता हूँ:\n• योजनाओं की पात्रता जाँचना\n• लोन एप्लीकेशन बनाना\n• ट्रेड रिकॉर्ड PDF बनाना\n• ज़रूरी दस्तावेज़ बताना'
          : 'Namaste! I\'m your ShilpMitra AI Agent. I don\'t just chat — I take actions for you! 🤖\n\nI can:\n• Check your scheme eligibility\n• Generate loan applications\n• Create trade record PDFs\n• Tell you what documents you need',
        time: new Date(),
        suggestedActions: [
          'Check my eligibility',
          'What documents do I need?',
          'Generate trade record',
        ]
      }]);
      setInitialized(true);
    }
  }, [initialized, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = useCallback(async (text, msgIndex) => {
    if (ttsPlaying === msgIndex) {
      audioRef.current?.pause();
      setTtsPlaying(null);
      return;
    }
    try {
      setTtsPlaying(msgIndex);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 500), language: lang }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audioRef.current = audio;
        audio.onended = () => setTtsPlaying(null);
        audio.play();
      } else {
        setTtsPlaying(null);
      }
    } catch {
      setTtsPlaying(null);
    }
  }, [ttsPlaying, lang]);

  const handleAction = useCallback(async (actionText) => {
    setInput('');
    await handleSend(actionText);
  }, []);

  if (isHidden) return null;

  const handleSend = async (overrideMsg) => {
    const userMsg = (overrideMsg || input).trim();
    if (!userMsg || loading) return;
    if (!overrideMsg) setInput('');

    setMessages(prev => [...prev, { role: 'user', text: userMsg, time: new Date() }]);
    setLoading(true);

    try {
      const userId = currentUser?.id || DEMO_USER_ID;

      let data;
      try {
        // Try the autonomous agent endpoint (works on Vercel)
        const res = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            message: userMsg,
            language: lang,
            history: messages.slice(-6).map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })),
          }),
        });
        if (!res.ok) throw new Error('Agent endpoint unavailable');
        data = await res.json();
      } catch {
        // Fallback to client-side agent (local dev — full agent with tools)
        const { runAgent } = await import('../lib/agentLocal.js');
        const profile = { name: currentUser?.name || 'Raju Kumar', craft: currentUser?.craft || 'Pottery', location: currentUser?.location || 'Khurja, UP', totalSales: 81700, group: currentUser?.group_status || 'OBC' };
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

      // If tool generated a PDF, add download action
      if (data.toolResult?.action === 'generate_pdf') {
        agentMsg.pdfAction = data.toolResult;
      }

      setMessages(prev => [...prev, agentMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'agent',
        text: lang === 'hi'
          ? 'क्षमा करें, कनेक्शन में समस्या हुई। कृपया पुनः प्रयास करें।'
          : 'Sorry, I had trouble connecting. Please try again in a moment.',
        time: new Date(),
      }]);
    }
    setLoading(false);
  };

  const getToolBadge = (toolUsed) => {
    const badges = {
      check_eligibility: { icon: '✅', label: 'Checked Eligibility' },
      generate_trade_record: { icon: '📄', label: 'Trade Record Ready' },
      generate_loan_application: { icon: '🏦', label: 'Loan App Ready' },
      generate_eligibility_certificate: { icon: '📜', label: 'Certificate Ready' },
      check_missing_documents: { icon: '📋', label: 'Doc Check Complete' },
      get_sales_summary: { icon: '📊', label: 'Sales Analyzed' },
      explain_scheme: { icon: '💡', label: 'Scheme Explained' },
    };
    return badges[toolUsed] || null;
  };

  return (
    <>
      {/* FAB Button */}
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
            className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50">

            {/* Header */}
            <div className="p-4 text-white flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #1F3C88, #4A90E2)' }}>
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg">🤖</div>
              <div className="flex-1">
                <h3 className="text-sm font-bold">ShilpMitra AI Agent</h3>
                <p className="text-[10px] text-white/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Autonomous Agent — Takes Actions
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map((msg, i) => (
                <div key={i}>
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3.5 py-2.5 text-[13px] leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-[#1F3C88] text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-slate-700 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm'}`}>

                      {/* Tool badge */}
                      {msg.toolUsed && msg.toolUsed !== 'none' && (
                        <div className="flex items-center gap-1.5 mb-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold"
                          style={{ background: 'linear-gradient(135deg, #EBF5FF, #F0FFF0)', color: '#1F3C88' }}>
                          <span>{getToolBadge(msg.toolUsed)?.icon || '⚙️'}</span>
                          <span>{getToolBadge(msg.toolUsed)?.label || msg.toolUsed}</span>
                        </div>
                      )}

                      {/* Message text */}
                      <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                      {/* TTS button for agent messages */}
                      {msg.role === 'agent' && (
                        <button onClick={() => speakText(msg.text, i)}
                          className="mt-1.5 text-[10px] text-slate-400 hover:text-[#1F3C88] flex items-center gap-1 transition-colors">
                          <span className={ttsPlaying === i ? 'animate-pulse' : ''}>{ttsPlaying === i ? '🔊' : '🔈'}</span>
                          {ttsPlaying === i ? (lang === 'hi' ? 'बंद करें' : 'Stop') : (lang === 'hi' ? 'सुनें' : 'Listen')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Suggested Action Buttons */}
                  {msg.suggestedActions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                      {msg.suggestedActions.map((action, j) => (
                        <button key={j}
                          onClick={() => handleAction(action)}
                          className="px-3 py-1.5 text-[11px] font-medium rounded-full border border-[#1F3C88]/20 text-[#1F3C88] bg-[#1F3C88]/5 hover:bg-[#1F3C88]/10 transition-all">
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* PDF Download Action */}
                  {msg.pdfAction && (
                    <div className="mt-2 ml-1">
                      <button
                        onClick={async () => {
                          try {
                            const r = await fetch(msg.pdfAction.url, {
                              method: msg.pdfAction.method,
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(msg.pdfAction.body),
                            });
                            const d = await r.json();
                            if (d.pdfUrl) window.open(d.pdfUrl, '_blank');
                          } catch { /* ignore */ }
                        }}
                        className="px-4 py-2 text-[12px] font-semibold rounded-xl text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #1F3C88, #4A90E2)' }}>
                        📄 Download {msg.pdfAction.type === 'trade_record' ? 'Trade Record' :
                          msg.pdfAction.type === 'loan_application' ? 'Loan Application' :
                            'Certificate'}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-[#1F3C88] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-[#4A90E2] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-[#3CCFCF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] text-slate-400 animate-pulse">
                        {lang === 'hi' ? '🤖 Agent काम कर रहा है...' : '🤖 Agent working...'}
                      </span>
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
                  placeholder={lang === 'hi' ? 'योजना, बिक्री, दस्तावेज़ के बारे में पूछें...' : 'Ask about schemes, sales, documents...'}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 border border-slate-200 focus:border-[#4A90E2] focus:outline-none transition-colors" />
                <button onClick={() => handleSend()} disabled={loading || !input.trim()}
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
