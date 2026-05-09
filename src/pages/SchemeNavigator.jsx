import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import useAppStore from '../store/appStore';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const DEMO_USER_ID = '33f29c7a-34b8-4ea0-8a7b-25d323992b91';

const demoArtisans = [
  {
    id: 'raju', name: 'Raju', nameHi: 'राजू', craft: 'Block-print', craftHi: 'ब्लॉक-प्रिंट',
    location: 'Rajasthan', months: 7, totalSales: 62000, emoji: '🖨️',
    eligibility: {
      vishwakarma: { status: 'eligible', label: 'पात्र ✅', reason: 'ब्लॉक-प्रिंटिंग अधिसूचित शिल्प है। 7 महीने सत्यापित बिक्री।', reasonEn: 'Block-printing is notified craft. 7 months verified.' },
      mudra: { status: 'eligible', label: 'शिशु पात्र ✅', reason: '6+ महीने नियमित बिक्री। Trade Record PDF तैयार।', reasonEn: '6+ months sales. Shishu tier (₹50K).' },
      sfurti: { status: 'not-yet', label: 'अभी नहीं ⏳', reason: '1 सदस्य — 20 चाहिए।', reasonEn: 'Only 1 member. Need 20 for cluster.' },
    }
  },
  {
    id: 'sunita', name: 'Sunita', nameHi: 'सुनीता', craft: 'Handloom', craftHi: 'हथकरघा',
    location: 'MP', months: 18, totalSales: 148000, emoji: '🧵',
    eligibility: {
      vishwakarma: { status: 'eligible', label: 'पात्र ✅', reason: 'हथकरघा अधिसूचित शिल्प। 18 महीने सत्यापित।', reasonEn: 'Handloom notified craft. 18 months.' },
      mudra: { status: 'eligible', label: 'किशोर पात्र ✅', reason: '18 महीने = किशोर tier (₹50K–₹5L)।', reasonEn: '18 months = Kishor tier (₹50K-₹5L).' },
      sfurti: { status: 'not-yet', label: 'लगभग ⏳', reason: '4 सदस्य — 16 और चाहिए।', reasonEn: '4 members. Need 16 more.' },
    }
  },
  {
    id: 'priya', name: 'Priya', nameHi: 'प्रिया', craft: 'Pottery', craftHi: 'कुम्हार',
    location: 'Gujarat', months: 2, totalSales: 8000, emoji: '🏺',
    eligibility: {
      vishwakarma: { status: 'not-yet', label: 'अभी नहीं ⏳', reason: 'शिल्प योग्य, Aadhaar पंजीकरण शेष।', reasonEn: 'Craft qualifies. Aadhaar registration pending.' },
      mudra: { status: 'ineligible', label: 'अपात्र ❌', reason: '2 महीने — 6 महीने चाहिए।', reasonEn: '2 months. Need 6 months minimum.' },
      sfurti: { status: 'ineligible', label: 'अपात्र ❌', reason: 'कोई क्लस्टर नहीं, कोई रिकॉर्ड नहीं।', reasonEn: 'No cluster, no records.' },
    }
  }
];

const schemes = [
  {
    id: 'vishwakarma', name: 'PM Vishwakarma', nameHi: 'पीएम विश्वकर्मा', icon: '🔨',
    max: '₹3 लाख', maxEn: '₹3 Lakh', tag: 'व्यक्तिगत कारीगर',
    color: 'from-blue-600 to-indigo-700',
    benefits: ['₹15,000 Toolkit Grant', '₹2L Collateral-free Loan', 'Skill Training', 'Digital Transaction Incentive'],
    criteria: [
      { hi: '18 अधिसूचित शिल्पों में लगे हों', en: 'Engaged in 18 notified crafts', done: true },
      { hi: '18+ आयु, स्व-नियोजित', en: 'Age 18+, self-employed', done: true },
      { hi: 'PM Vishwakarma पोर्टल पंजीकरण', en: 'Portal registration with Aadhaar', done: false },
      { hi: 'प्रति परिवार एक सदस्य', en: 'One per family', done: true },
    ]
  },
  {
    id: 'mudra', name: 'MUDRA Loan', nameHi: 'मुद्रा ऋण', icon: '🏦',
    max: '₹10 लाख', maxEn: '₹10 Lakh', tag: 'शिशु • किशोर • तरुण',
    color: 'from-teal-500 to-emerald-600',
    benefits: ['Shishu: up to ₹50,000', 'Kishor: ₹50K–₹5L', 'Tarun: ₹5L–₹10L', 'No collateral for Shishu/Kishor'],
    criteria: [
      { hi: 'गैर-कॉर्पोरेट सूक्ष्म उद्यम', en: 'Non-corporate micro enterprise', done: true },
      { hi: 'व्यापार गतिविधि प्रमाण', en: 'Business activity proof (Trade PDF)', done: true },
      { hi: 'आधार + PAN', en: 'Aadhaar + PAN or equivalent', done: false },
      { hi: '6 महीने नियमित बिक्री', en: '6 months consistent sales', done: true },
    ]
  },
  {
    id: 'sfurti', name: 'SFURTI', nameHi: 'SFURTI क्लस्टर', icon: '🏘️',
    max: '₹8 करोड़', maxEn: '₹8 Crore', tag: 'न्यूनतम 20 सदस्य',
    color: 'from-purple-500 to-violet-700',
    benefits: ['Cluster infrastructure', 'Common facility center', 'Machinery & equipment', 'Marketing support'],
    criteria: [
      { hi: '20+ कारीगर क्लस्टर', en: 'Minimum 20 artisans', done: false },
      { hi: 'SHG/सहकारी पंजीकरण', en: 'Registered as SHG/cooperative', done: false },
      { hi: 'संयुक्त टर्नओवर सत्यापन', en: 'Combined turnover verified', done: false },
      { hi: 'Nodal Agency प्रायोजन', en: 'Nodal Agency sponsorship', done: false },
    ]
  }
];

const quickActions = {
  en: [
    { label: '✅ Check my eligibility', msg: 'Check my eligibility for all schemes' },
    { label: '📋 Documents needed?', msg: 'What documents do I need for schemes?' },
    { label: '🏦 Generate bank proof', msg: 'Generate bank proof from my sales' },
    { label: '🔨 Explain Vishwakarma', msg: 'Explain PM Vishwakarma scheme in detail' },
    { label: '🏦 Explain MUDRA', msg: 'Explain MUDRA loan scheme' },
    { label: '🏘️ Explain SFURTI', msg: 'Explain SFURTI cluster scheme' },
  ],
  hi: [
    { label: '✅ पात्रता जाँचें', msg: 'मेरी सभी योजनाओं की पात्रता जाँचें' },
    { label: '📋 दस्तावेज़ बताएं', msg: 'योजनाओं के लिए कौन से दस्तावेज़ चाहिए?' },
    { label: '🏦 बैंक प्रूफ बनाएं', msg: 'मेरी बिक्री से बैंक प्रूफ बनाएं' },
    { label: '🔨 विश्वकर्मा समझाएं', msg: 'PM विश्वकर्मा योजना के बारे में बताएं' },
    { label: '🏦 मुद्रा समझाएं', msg: 'मुद्रा ऋण योजना समझाएं' },
    { label: '🏘️ SFURTI समझाएं', msg: 'SFURTI क्लस्टर योजना समझाएं' },
  ],
};

export default function SchemeNavigator() {
  const { lang } = useTranslation();
  const { currentUser } = useAppStore();
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Initial greeting
  useEffect(() => {
    if (chatMessages.length === 0) {
      const name = currentUser?.name || 'कारीगर';
      setChatMessages([{
        role: 'ai',
        text: lang === 'hi'
          ? `नमस्ते ${name} जी! 🤖 मैं ShilpMitra AI Agent हूँ।\n\nमैं योजनाओं के बारे में सब बता सकता हूँ:\n• PM विश्वकर्मा, मुद्रा, SFURTI\n• पात्रता जाँच और दस्तावेज़ सूची\n• बैंक प्रूफ / आय प्रमाणपत्र बनाना\n\nनीचे बटन दबाएं या टाइप करें!`
          : `Namaste ${name}! 🤖 I'm your ShilpMitra AI Agent.\n\nI can help you with:\n• PM Vishwakarma, MUDRA, SFURTI details\n• Eligibility check & document checklist\n• Generate bank proof / income certificate\n\nTap a button below or type your question!`,
      }]);
    }
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  // Build profile from real user data
  const profile = useMemo(() => ({
    id: currentUser?.id || DEMO_USER_ID,
    name: currentUser?.name || 'Raju Kumar',
    craft: currentUser?.craft_type || currentUser?.craft || 'Pottery',
    location: currentUser?.location || 'Khurja, UP',
    totalSales: currentUser?.totalSales || 81700,
    group: currentUser?.group_status || 'OBC',
  }), [currentUser]);

  const handleSend = async (overrideMsg) => {
    const msg = (overrideMsg || userInput).trim();
    if (!msg || isLoading) return;
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setUserInput('');
    setIsLoading(true);

    try {
      // Use the same runAgent as the floating chatbot
      const { runAgent } = await import('../lib/agentLocal.js');
      const data = await runAgent(msg, profile, chatMessages, lang);

      const reply = lang === 'hi' ? (data.replyHi || data.reply)
        : lang === 'kn' ? (data.replyKn || data.reply)
        : data.reply;

      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: reply || 'I processed your request.',
        toolUsed: data.toolUsed,
        suggestedActions: data.suggestedActions || [],
      }]);
    } catch (e) {
      console.error('[SchemeChat] Error:', e);
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: lang === 'hi'
          ? 'क्षमा करें, कनेक्शन में समस्या हुई। कृपया पुनः प्रयास करें।'
          : 'Sorry, connection error. Please try again.',
        suggestedActions: lang === 'hi'
          ? ['✅ पात्रता जाँचें', '📋 दस्तावेज़ बताएं']
          : ['✅ Check my eligibility', '📋 What documents do I need?'],
      }]);
    } finally { setIsLoading(false); }
  };

  const actions = quickActions[lang] || quickActions.en;

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }} className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>✅ Scheme Navigator</h1>
        <p className="text-sm text-slate-500 mt-1">AI-powered Scheme Eligibility</p>
      </motion.div>

      {/* Stats Banner */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {[
          { num: '40%', label: 'Never apply', color: 'text-red-500' },
          { num: '40%', label: 'Get rejected', color: 'text-amber-500' },
          { num: '30%', label: 'Machinery idle', color: 'text-orange-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <div className={`text-2xl font-extrabold ${s.color}`} style={{ fontFamily: 'Sora, sans-serif' }}>{s.num}</div>
            <p className="text-[11px] text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Scheme Cards */}
      <motion.section variants={fadeUp}>
        <h2 className="text-sm font-bold text-slate-700 mb-3">Government Schemes</h2>
        <div className="space-y-3">
          {schemes.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <button className="w-full text-left p-4 flex items-start gap-3" onClick={() => setExpandedScheme(expandedScheme === s.id ? null : s.id)}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shrink-0`}>{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800">{s.name}</h3>
                  <p className="text-[12px] text-slate-400">{s.nameHi} • {s.tag}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>{s.maxEn}</div>
                  <span className="text-slate-400">{expandedScheme === s.id ? '▲' : '▼'}</span>
                </div>
              </button>
              <AnimatePresence>
                {expandedScheme === s.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-100">
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A90E2] mb-2">BENEFITS</p>
                        <div className="flex flex-wrap gap-2">
                          {s.benefits.map((b, i) => <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-[#EAF4FF] text-[#1F3C88] font-medium">{b}</span>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A90E2] mb-2">ELIGIBILITY</p>
                        {s.criteria.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 py-1.5">
                            <span className="text-sm">{c.done ? '✅' : '⭕'}</span>
                            <div>
                              <p className="text-[13px] text-slate-700">{c.en}</p>
                              <p className="text-[11px] text-slate-400">{c.hi}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Ask AI about this scheme */}
                      <button
                        onClick={() => handleSend(`Explain ${s.name} scheme in detail`)}
                        className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#1F3C88] to-[#4A90E2] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        🤖 Ask AI about {s.name}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Live Demo */}
      <motion.section variants={fadeUp} className="bg-white rounded-xl border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">👥</span>
          <h2 className="text-sm font-bold text-slate-700">Live Demo — Tap to check</h2>
        </div>
        <div className="flex gap-2 mb-3">
          {demoArtisans.map(a => (
            <button key={a.id} onClick={() => setSelectedArtisan(selectedArtisan?.id === a.id ? null : a)}
              className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${selectedArtisan?.id === a.id ? 'border-[#4A90E2] bg-[#EAF4FF]' : 'border-slate-200 bg-white hover:border-[#4A90E2]/30'}`}>
              <div className="text-2xl mb-1">{a.emoji}</div>
              <p className="text-sm font-semibold text-slate-700">{a.name}</p>
              <p className="text-[11px] text-slate-400">{a.craftHi}</p>
            </button>
          ))}
        </div>
        <AnimatePresence>
          {selectedArtisan && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{selectedArtisan.emoji}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{selectedArtisan.name} • {selectedArtisan.nameHi}</h3>
                    <p className="text-[12px] text-slate-400">{selectedArtisan.craft} • {selectedArtisan.months} months • ₹{selectedArtisan.totalSales.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                {['vishwakarma', 'mudra', 'sfurti'].map(sid => {
                  const e = selectedArtisan.eligibility[sid];
                  const s = schemes.find(x => x.id === sid);
                  const badgeColors = { eligible: 'bg-emerald-50 text-emerald-600', 'not-yet': 'bg-orange-50 text-orange-500', ineligible: 'bg-red-50 text-red-500' };
                  return (
                    <div key={sid} className="bg-white border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-700">{s.icon} {s.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badgeColors[e.status]}`}>{e.label}</span>
                      </div>
                      <p className="text-[13px] text-slate-600">{e.reasonEn}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* AI Chat — Powered by same agentLocal.js as floating chatbot */}
      <motion.section variants={fadeUp} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #1F3C88, #4A90E2)' }}>
          <span className="text-lg">🤖</span>
          <h3 className="text-sm font-bold text-white flex-1">AI Scheme Assistant</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">Agent</span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 p-3 overflow-x-auto hide-scrollbar border-b border-slate-50">
          {actions.map((a, i) => (
            <button key={i} onClick={() => handleSend(a.msg)} disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-full bg-[#EAF4FF] text-[#1F3C88] text-[11px] font-semibold whitespace-nowrap hover:bg-[#1F3C88] hover:text-white transition-all disabled:opacity-40">
              {a.label}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="max-h-[300px] overflow-y-auto hide-scrollbar space-y-2 p-4 bg-slate-50">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'ai' && <span className="text-sm mt-1">🤖</span>}
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${msg.role === 'user' ? 'bg-[#1F3C88] text-white rounded-br-md' : 'bg-white text-slate-700 rounded-bl-md border border-slate-100'}`}>
                <p className="text-[13px] whitespace-pre-line">{msg.text}</p>
                {msg.toolUsed && msg.toolUsed !== 'none' && (
                  <p className="text-[10px] mt-1 opacity-50">🔧 {msg.toolUsed}</p>
                )}
              </div>
            </div>
          ))}
          {/* Suggested actions from agent response */}
          {chatMessages.length > 0 && chatMessages[chatMessages.length - 1]?.suggestedActions?.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {chatMessages[chatMessages.length - 1].suggestedActions.map((action, j) => (
                <button key={j} onClick={() => handleSend(action)}
                  className="px-2.5 py-1 rounded-full bg-[#EAF4FF] text-[#1F3C88] text-[11px] font-medium hover:bg-[#1F3C88] hover:text-white transition-all">
                  {action}
                </button>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="flex gap-2">
              <span className="text-sm">🤖</span>
              <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 flex gap-1 items-center border border-slate-100">
                {[0, 150, 300].map(d => <div key={d} className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 p-3 border-t border-slate-100">
          <input className="flex-1 h-10 px-3 rounded-xl bg-slate-50 text-sm border border-slate-200 focus:border-[#4A90E2] outline-none transition-colors"
            placeholder={lang === 'hi' ? 'योजना के बारे में पूछें...' : 'Ask about schemes...'}
            value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} disabled={isLoading} />
          <button onClick={() => handleSend()} disabled={isLoading || !userInput.trim()}
            className="w-10 h-10 bg-[#1F3C88] text-white rounded-xl flex items-center justify-center hover:bg-[#4A90E2] transition-all disabled:opacity-40 text-lg">
            →
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}
