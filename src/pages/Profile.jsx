import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import useAppStore from '../store/appStore';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function Profile() {
  const navigate = useNavigate();
  const { t, lang, setLanguage } = useTranslation();
  const { currentUser } = useAppStore();
  const artisan = {
    name: currentUser.name || 'Raju Kumar',
    nameHi: currentUser.nameHi || 'राजू कुमार',
    avatar: (currentUser.name || 'R')[0],
    craft: currentUser.craft || currentUser.craft_type || 'Pottery',
    location: currentUser.location || 'Khurja, UP',
    verified: true,
    totalSales: currentUser.totalSales || 81700,
    activeOrders: 3,
    fundingEligibility: 80,
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-2xl mx-auto">
      
      {/* Profile Hero */}
      <motion.section variants={fadeUp} 
        className="rounded-2xl p-8 flex flex-col items-center text-center text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1F3C88 0%, #4A90E2 60%, #3CCFCF 100%)' }}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm text-white flex items-center justify-center text-3xl font-bold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
          {artisan.avatar}
        </div>
        <h2 className="text-xl font-bold">{artisan.name}</h2>
        <p className="text-sm text-white/70 mt-0.5">{artisan.nameHi}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs px-3 py-1 rounded-lg bg-white/15">{artisan.craft}</span>
          <span className="text-xs px-3 py-1 rounded-lg bg-white/15">{artisan.location}</span>
        </div>
        {artisan.verified && (
          <div className="flex items-center gap-1.5 mt-3 text-cyan-200 text-xs font-semibold">
            ✓ {t('sell.aiVerified')}
          </div>
        )}
      </motion.section>

      {/* Stats */}
      <motion.section variants={fadeUp} className="grid grid-cols-3 gap-3 mt-5">
        {[
          { val: `₹${(artisan.totalSales / 1000).toFixed(0)}K`, label: t('sell.totalSales'), emoji: '💰' },
          { val: artisan.activeOrders, label: lang === 'hi' ? 'ऑर्डर' : 'Orders', emoji: '📦' },
          { val: `${artisan.fundingEligibility}%`, label: t('fund.eligible'), emoji: '✅' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <div className="text-sm mb-1">{s.emoji}</div>
            <div className="text-lg font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>{s.val}</div>
            <div className="text-[11px] text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </motion.section>

      {/* Language Selector */}
      <motion.section variants={fadeUp} className="bg-white rounded-xl border border-slate-100 p-5 mt-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">🌐 {t('common.language')}</h3>
        <div className="flex gap-2">
          {[
            { id: 'en', label: 'English' },
            { id: 'hi', label: 'हिन्दी' },
            { id: 'kn', label: 'ಕನ್ನಡ' },
          ].map((l) => (
            <button key={l.id} onClick={() => setLanguage(l.id)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                lang === l.id
                  ? 'bg-gradient-to-r from-[#1F3C88] to-[#4A90E2] text-white shadow-md'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}>
              {l.label}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Menu Items */}
      <motion.section variants={fadeUp} className="bg-white rounded-xl border border-slate-100 overflow-hidden mt-5">
        {[
          { emoji: '📦', label: t('sell.yourListings'), to: '/listings' },
          { emoji: '📋', label: t('fund.tradeLedger'), to: '/ledger' },
          { emoji: '👥', label: t('cluster.clusterManagement'), to: '/clusters' },
          { emoji: '✅', label: t('fund.schemeNavigator'), to: '/schemes' },
          { emoji: '🔔', label: t('notifications.title'), to: '/notifications' },
          { emoji: '⚙️', label: t('admin.title'), to: '/admin/policies' },
        ].map((item, i) => (
          <button key={item.to} onClick={() => navigate(item.to)}
            className={`w-full px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left ${i < 5 ? 'border-b border-slate-50' : ''}`}>
            <span className="text-base">{item.emoji}</span>
            <span className="text-sm font-medium text-slate-700 flex-1">{item.label}</span>
            <span className="text-slate-300">→</span>
          </button>
        ))}
      </motion.section>
    </motion.div>
  );
}
