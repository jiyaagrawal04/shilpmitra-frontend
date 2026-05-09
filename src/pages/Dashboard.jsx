import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useSupabaseData } from '../hooks/useSupabaseData';
import useAppStore from '../store/appStore';
import { getTransactions, getProducts } from '../lib/api';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { currentUser } = useAppStore();

  // Fetch transactions from database
  const { data: txns } = useSupabaseData(
    () => getTransactions(currentUser.id),
    [currentUser.id],
    []
  );

  const recentTx = (txns || []).slice(0, 4);
  const totalSales = (txns || []).reduce((s, tx) => s + Number(tx.amount), 0);
  const txCount = (txns || []).length;

  // Compute monthly income from transactions
  const monthlyIncome = (() => {
    const monthMap = {};
    (txns || []).forEach(tx => {
      const d = new Date(tx.date || tx.created_at);
      const key = d.toLocaleString('en-IN', { month: 'short' });
      monthMap[key] = (monthMap[key] || 0) + Number(tx.amount);
    });
    const entries = Object.entries(monthMap).slice(-3);
    return entries.length > 0
      ? entries.map(([month, amount]) => ({ month, amount }))
      : [{ month: 'Oct', amount: 5350 }, { month: 'Nov', amount: 13200 }, { month: 'Dec', amount: 12400 }];
  })();

  const maxIncome = Math.max(...monthlyIncome.map(m => m.amount), 1);

  const greeting = lang === 'hi' ? `नमस्ते, ${currentUser.name?.split(' ')[0] || 'राजू'}! 🙏` :
                   lang === 'kn' ? `ನಮಸ್ತೆ, ${currentUser.name?.split(' ')[0] || 'ರಾಜು'}! 🙏` :
                   `Namaste, ${currentUser.name?.split(' ')[0] || 'Raju'}! 🙏`;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

      {/* ─── Header ─── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>{greeting}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600">
              {lang === 'hi' ? 'AI एजेंट सक्रिय — आपकी बिक्री पर नज़र' : 'AI Agent active — monitoring your sales'}
            </span>
          </div>
        </div>
        <button onClick={() => navigate('/listings/new')} 
          className="self-start px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1F3C88] to-[#4A90E2] text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md">
          ➕ {t('sell.newListing')}
        </button>
      </motion.div>

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left Column: AI Card + Notifications */}
        <div className="lg:col-span-8 space-y-5">

          {/* AI Agent Hero Card */}
          <motion.div variants={fadeUp} 
            className="relative overflow-hidden rounded-2xl p-6 text-white"
            style={{ background: 'linear-gradient(135deg, #1F3C88 0%, #4A90E2 60%, #3CCFCF 100%)' }}>
            <div className="absolute top-0 right-0 w-52 h-52 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-14 -translate-x-14" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start gap-5">
              {/* Circular Progress */}
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3CCFCF" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="37.68" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">85%</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🤖</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">AI Agent Update</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1">
                  {lang === 'hi' ? 'PM Vishwakarma पात्र!' : 'PM Vishwakarma Eligible!'}
                </h3>
                <p className="text-sm text-white/70 mb-4 max-w-md">
                  {lang === 'hi' 
                    ? '18 महीने की बिक्री से ₹15,000 toolkit grant + ₹1 लाख loan अनलॉक' 
                    : '18 months of verified sales unlocked ₹15,000 toolkit grant + ₹1L credit'}
                </p>
                <button onClick={() => navigate('/schemes')} 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-semibold hover:bg-white/25 transition-all">
                  → {lang === 'hi' ? 'योजनाएं देखें' : 'View Schemes'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* AI Notifications */}
          <motion.div variants={fadeUp} className="space-y-2">
            {[
              { emoji: '✅', text: lang === 'hi' ? 'PM Vishwakarma — ₹15,000 toolkit grant पात्र!' : 'PM Vishwakarma — Eligible for ₹15,000 toolkit grant!', time: '2m', accent: true },
              { emoji: '🏦', text: lang === 'hi' ? 'MUDRA शिशु — 6 महीने बिक्री सत्यापित' : 'MUDRA Shishu — 6 months verified sales', time: '1h', accent: false },
              { emoji: '📄', text: lang === 'hi' ? 'Trade Record PDF अपडेट हुई' : 'Trade Record PDF updated', time: '3h', accent: false },
            ].map((n, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                n.accent 
                  ? 'bg-emerald-50 border-emerald-200/60 shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}>
                <span className="text-base shrink-0">{n.emoji}</span>
                <span className="text-sm text-slate-700 flex-1">{n.text}</span>
                <span className="text-[11px] text-slate-400 shrink-0">{n.time}</span>
              </div>
            ))}
          </motion.div>

          {/* Quick Actions + Income Chart Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Quick Actions */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
              {[
                { emoji: '📦', label: lang === 'hi' ? 'मेरे उत्पाद' : 'My Listings', path: '/listings' },
                { emoji: '📋', label: lang === 'hi' ? 'व्यापार बही' : 'Trade Ledger', path: '/ledger' },
                { emoji: '👥', label: lang === 'hi' ? 'मेरा क्लस्टर' : 'My Cluster', path: '/clusters' },
                { emoji: '✅', label: lang === 'hi' ? 'योजनाएं' : 'Schemes', path: '/schemes' },
              ].map((a) => (
                <button key={a.path} onClick={() => navigate(a.path)} 
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-slate-100 hover:border-[#4A90E2]/30 hover:shadow-md transition-all group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{a.emoji}</span>
                  <span className="text-xs font-semibold text-slate-600 text-center">{a.label}</span>
                </button>
              ))}
            </motion.div>

            {/* Income Chart */}
            <motion.div variants={fadeUp} className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-700">{lang === 'hi' ? 'आय रुझान' : 'Income Trends'}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 font-medium">3 months</span>
              </div>
              <div className="flex items-end justify-between h-[100px] gap-3">
                {monthlyIncome.map((m, i) => (
                  <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-[11px] font-semibold text-slate-500">₹{(m.amount/1000).toFixed(0)}K</span>
                    <div className="w-full rounded-t-lg relative" style={{ height: `${(m.amount / maxIncome) * 70}px` }}>
                      <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 0.8, delay: i * 0.15 }}
                        className={`w-full rounded-t-lg ${i === monthlyIncome.length - 1 ? 'bg-gradient-to-t from-[#1F3C88] to-[#4A90E2]' : 'bg-[#EAF4FF]'}`}
                        style={{ height: '100%' }} />
                    </div>
                    <span className={`text-[11px] ${i === monthlyIncome.length - 1 ? 'font-bold text-slate-700' : 'text-slate-400'}`}>{m.month}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Stats + Recent Activity */}
        <div className="lg:col-span-4 space-y-5">

          {/* Stats Cards */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 lg:grid-cols-1 gap-3">
            {[
              { label: lang === 'hi' ? 'कुल बिक्री' : 'Total Sales', val: `₹${(totalSales / 1000).toFixed(0)}K` || '₹82K', emoji: '💰', color: 'from-blue-500/10 to-blue-500/5' },
              { label: lang === 'hi' ? 'लेन-देन' : 'Transactions', val: String(txCount || '47'), emoji: '📊', color: 'from-emerald-500/10 to-emerald-500/5' },
              { label: lang === 'hi' ? 'वृद्धि' : 'Growth', val: '+12%', emoji: '📈', color: 'from-cyan-500/10 to-cyan-500/5' },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl p-4 bg-gradient-to-br ${s.color} border border-slate-100`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{s.emoji}</span>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{s.label}</span>
                </div>
                <span className="text-xl font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>{s.val}</span>
              </div>
            ))}
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={fadeUp} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-700">{lang === 'hi' ? 'हाल की गतिविधि' : 'Recent Activity'}</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {recentTx.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-slate-400">
                  {lang === 'hi' ? 'कोई हाल की गतिविधि नहीं' : 'No recent activity'}
                </div>
              )}
              {recentTx.map((tx) => (
                <div key={tx.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-25 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#EAF4FF] flex items-center justify-center text-sm shrink-0">🧾</div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-slate-700 truncate">{tx.product || tx.notes || tx.buyer_name}</p>
                      <p className="text-[11px] text-slate-400">{new Date(tx.date || tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 shrink-0 ml-2">+₹{Number(tx.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100 text-center">
              <button onClick={() => navigate('/ledger')} className="text-[12px] font-semibold text-[#4A90E2] hover:text-[#1F3C88] transition-colors">
                {t('common.viewAll')} →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
