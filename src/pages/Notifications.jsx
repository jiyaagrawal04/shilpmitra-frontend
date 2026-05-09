import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { getNotifications } from '../lib/api';
import useAppStore from '../store/appStore';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const typeEmojis = {
  funding: '🏆', scheme_eligible: '✅', payment: '💰',
  payment_received: '💰', order_confirmed: '🛒',
  document: '📄', doc_pending: '📄', milestone: '🎯',
};

export default function Notifications() {
  const { t, lang } = useTranslation();
  const { currentUser, markNotificationRead: markReadGlobal } = useAppStore();
  const [filter, setFilter] = useState('all');
  const [readState, setReadState] = useState({});

  const { data: result } = useSupabaseData(
    () => getNotifications(currentUser.id),
    [currentUser.id],
    { notifications: [], unread_count: 0 }
  );

  const aiNotifs = [
    { id: 'ai1', type: 'scheme_eligible', title_en: 'Crossed ₹50,000 sales!', title_hi: '₹50,000 बिक्री पार!', body_en: 'Eligible for MUDRA Shishu Loan.', body_hi: 'MUDRA शिशु ऋण के लिए पात्र।', is_read: false, created_at: new Date(Date.now() - 60000).toISOString() },
    { id: 'ai2', type: 'scheme_eligible', title_en: 'PM Vishwakarma Toolkit Grant', title_hi: 'PM विश्वकर्मा Toolkit Grant', body_en: 'Ready for ₹15,000 toolkit grant.', body_hi: '₹15,000 toolkit grant तैयार।', is_read: false, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'ai3', type: 'doc_pending', title_en: 'Upload PAN Card', title_hi: 'PAN कार्ड अपलोड करें', body_en: 'PAN card required for MUDRA Kishor.', body_hi: 'MUDRA किशोर के लिए PAN अनिवार्य।', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
  ];

  const dbNotifs = (result.notifications || []).map(n => ({
    id: n.id, type: n.type, is_read: n.is_read ?? n.read ?? false,
    title_en: n.title_en || n.title || '', title_hi: n.title_hi || n.titleHi || '',
    body_en: n.body_en || n.body || '', body_hi: n.body_hi || n.bodyHi || '',
    created_at: n.created_at || new Date().toISOString()
  }));

  const allNotifs = [...aiNotifs, ...dbNotifs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const filtered = filter === 'all' ? allNotifs :
    filter === 'unread' ? allNotifs.filter(n => !n.is_read && !readState[n.id]) :
    allNotifs.filter(n => n.type === filter);

  const getTitle = (n) => lang === 'hi' ? (n.title_hi || n.title_en) : n.title_en;
  const getBody = (n) => lang === 'hi' ? (n.body_hi || n.body_en) : n.body_en;
  const handleMarkRead = (id) => { setReadState(p => ({ ...p, [id]: true })); markReadGlobal(); };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto">
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>🔔 {t('notifications.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{lang === 'hi' ? 'AI अलर्ट और स्मार्ट सूचनाएं' : 'AI Alerts & Smart Notifications'}</p>
      </motion.div>
      <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-5">
        {[{ id: 'all', label: t('notifications.all') }, { id: 'unread', label: t('notifications.unread') }, { id: 'scheme_eligible', label: '🤖 AI' }, { id: 'payment_received', label: '💰' }, { id: 'doc_pending', label: '📄' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filter === f.id ? 'bg-gradient-to-r from-[#1F3C88] to-[#4A90E2] text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-[#4A90E2]/30'}`}>
            {f.label}
          </button>
        ))}
      </motion.div>
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16"><div className="text-4xl mb-3">🔕</div><p className="text-sm text-slate-400">{t('notifications.noNotifications')}</p></div>
        ) : filtered.map(n => {
          const isRead = n.is_read || readState[n.id];
          return (
            <motion.div key={n.id} variants={fadeUp}
              className={`bg-white rounded-xl border p-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-all ${!isRead ? 'border-[#4A90E2]/30 shadow-sm' : 'border-slate-100'}`}
              onClick={() => !isRead && handleMarkRead(n.id)}>
              <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] flex items-center justify-center text-base shrink-0">{typeEmojis[n.type] || '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">{getTitle(n)}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400">{formatTime(n.created_at)}</span>
                    {!isRead && <span className="w-2 h-2 rounded-full bg-[#4A90E2] animate-pulse" />}
                  </div>
                </div>
                <p className="text-[13px] text-slate-500 mt-1">{getBody(n)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
