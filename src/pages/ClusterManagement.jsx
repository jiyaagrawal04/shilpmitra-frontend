import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { demoCluster as cluster } from '../lib/api';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const sfurtiChecklist = [
  { label: 'Members', value: '4 / 20', progress: 20, done: false },
  { label: 'SHG Registration', value: '✅ Done', progress: 100, done: true },
  { label: 'Combined Turnover', value: '₹2.1L / ₹5L', progress: 42, done: false },
  { label: 'Nodal Agency', value: 'Pending', progress: 0, done: false },
];

export default function ClusterManagement() {
  const [orderAmount, setOrderAmount] = useState(60000);
  const [showChecklist, setShowChecklist] = useState(true);
  const { t, lang } = useTranslation();
  const splits = cluster.members.map(m => ({ ...m, payout: Math.round(orderAmount * m.share / 100) }));
  const overallProgress = Math.round(sfurtiChecklist.reduce((s, r) => s + r.progress, 0) / sfurtiChecklist.length);

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }} 
      className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto">

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>
          👥 {cluster.name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t('cluster.clusterManagement')}</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">💰</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'hi' ? 'कुल राजस्व' : 'Total Revenue'}
            </span>
          </div>
          <div className="text-xl font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>₹{cluster.totalRevenue.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-400 mt-1">Combined turnover proof</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🏆</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SFURTI</span>
          </div>
          <div className="text-xl font-bold text-[#1F3C88] mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>{overallProgress}%</div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <motion.div className="bg-gradient-to-r from-[#3CCFCF] to-[#4A90E2] h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </motion.div>

      {/* Member Progress */}
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-slate-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-700">{lang === 'hi' ? 'सदस्य प्रगति' : 'Member Progress'}</h3>
            <p className="text-[11px] text-slate-400">SFURTI needs 20 minimum</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>{cluster.members.length}</span>
            <span className="text-sm text-slate-400"> / 20</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
          <motion.div className="bg-gradient-to-r from-[#1F3C88] to-[#4A90E2] h-3 rounded-full" initial={{ width: 0 }}
            animate={{ width: `${(cluster.members.length / 20) * 100}%` }} transition={{ duration: 1 }} />
        </div>
        <p className="text-xs text-orange-500 font-medium">⚠ Need {20 - cluster.members.length} more members</p>
      </motion.div>

      {/* SFURTI Checklist */}
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-5">
        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-25 transition-colors" onClick={() => setShowChecklist(!showChecklist)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-xl">🏘️</div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-700">SFURTI Checklist</h3>
              <p className="text-[11px] text-slate-400">₹8 Cr cluster grant</p>
            </div>
          </div>
          <span className="text-slate-400 text-lg">{showChecklist ? '▲' : '▼'}</span>
        </button>
        <AnimatePresence>
          {showChecklist && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-100">
              <div className="p-4 space-y-4">
                {sfurtiChecklist.map((r, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{r.label}</p>
                        <p className="text-[11px] text-slate-400">{r.value}</p>
                      </div>
                      {r.done
                        ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">✓ Done</span>
                        : <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 font-semibold">{r.progress}%</span>}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${r.done ? 'bg-emerald-400' : 'bg-[#4A90E2]'}`} style={{ width: `${r.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Split Calculator */}
        <motion.div variants={fadeUp} className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <span className="text-base">📊</span>
            <h3 className="text-sm font-bold text-slate-700">{lang === 'hi' ? 'भुगतान विभाजन' : 'Payment Split'}</h3>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">ORDER AMOUNT</label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-400">₹</span>
              <input type="number" value={orderAmount} onChange={e => setOrderAmount(Number(e.target.value) || 0)}
                className="w-full text-lg font-bold text-[#1F3C88] bg-transparent outline-none" style={{ fontFamily: 'Sora, sans-serif' }} />
            </div>
          </div>
          <div className="space-y-3">
            {splits.map((s, i) => (
              <div key={s.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${['bg-[#1F3C88]', 'bg-[#3CCFCF]', 'bg-[#4A90E2]', 'bg-purple-400'][i]}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{s.name}</p>
                    <p className="text-[11px] text-slate-400">{s.craft} • {s.share}%</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>₹{s.payout.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Members */}
        <motion.div variants={fadeUp}>
          <h3 className="text-sm font-bold text-slate-700 mb-3">{lang === 'hi' ? 'प्रमुख सदस्य' : 'Key Members'}</h3>
          <div className="space-y-2">
            {cluster.members.map(member => (
              <div key={member.id} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${member.color} flex items-center justify-center text-base`}>{member.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{member.name}</p>
                  <p className="text-[11px] text-slate-400">{member.craft} • {member.role}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#EAF4FF] text-[#1F3C88] font-semibold">{member.share}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="mt-5">
        <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1F3C88] to-[#4A90E2] text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2">
          📋 {lang === 'hi' ? 'साझा खाता प्रबंधित करें' : 'Manage Shared Ledger'}
        </button>
      </motion.div>
    </motion.div>
  );
}
