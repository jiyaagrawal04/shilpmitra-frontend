import { useState } from 'react';
import { motion } from 'framer-motion';
import { cluster } from '../data/demoData';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const dotColors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-outline'];

export default function ClusterManagement() {
  const [orderAmount, setOrderAmount] = useState(60000);
  const splits = cluster.members.map((m) => ({ ...m, payout: Math.round(orderAmount * m.share / 100) }));

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }} className="page-container space-y-lg pb-8">
      <motion.div variants={fadeUp}>
        <h2 className="font-h1-display text-h1-display text-primary mb-sm">{cluster.name}</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Cluster Management Dashboard</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-sm">
        <div className="glass-card rounded-xl p-md">
          <div className="flex items-center gap-2 mb-sm text-secondary">
            <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
            <span className="font-label-caps text-label-caps">Total Revenue</span>
          </div>
          <div className="font-h2-headline text-h2-headline text-primary">₹{cluster.totalRevenue.toLocaleString('en-IN')}</div>
        </div>
        <div className="glass-card rounded-xl p-md">
          <div className="flex items-center gap-2 mb-sm text-tertiary">
            <span className="material-symbols-outlined text-xl">military_tech</span>
            <span className="font-label-caps text-label-caps">SFURTI Progress</span>
          </div>
          <div className="font-h2-headline text-h2-headline text-on-surface mb-xs">{cluster.sfurtiProgress}%</div>
          <div className="w-full bg-surface-variant rounded-full h-2">
            <motion.div className="bg-secondary h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${cluster.sfurtiProgress}%` }} transition={{ duration: 1, delay: 0.3 }} />
          </div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mt-2 text-right">to next grant</p>
        </div>
      </motion.div>

      {/* Split Calculator */}
      <motion.section variants={fadeUp} className="glass-card rounded-xl p-md">
        <div className="flex items-center gap-2 mb-md border-b border-outline-variant/30 pb-sm">
          <span className="material-symbols-outlined text-primary">pie_chart</span>
          <h3 className="section-title">Payment Split Calculator</h3>
        </div>
        <div className="bg-surface-container-low rounded-lg p-md mb-md border border-outline-variant/20">
          <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">Order Amount</label>
          <div className="flex items-center gap-sm">
            <span className="font-h3-title text-h3-title text-on-surface-variant">₹</span>
            <input type="number" value={orderAmount} onChange={(e) => setOrderAmount(Number(e.target.value) || 0)}
              className="input-field text-h3-title font-h3-title text-primary font-bold" />
          </div>
        </div>
        <div className="space-y-sm relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-variant">
          {splits.map((s, i) => (
            <div key={s.id} className="flex justify-between items-center relative">
              <div className={`absolute -left-6 w-3 h-3 rounded-full ${dotColors[i]} ring-4 ring-surface`} />
              <div>
                <div className="font-body-md text-body-md text-on-surface font-semibold">{s.name}</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant">{s.share}% Share</div>
              </div>
              <div className={`font-body-md text-body-md font-semibold ${i === 0 ? 'text-primary' : i === 1 ? 'text-secondary' : 'text-tertiary'}`}>
                ₹{s.payout.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Members */}
      <motion.section variants={fadeUp}>
        <div className="flex justify-between items-center mb-md">
          <h3 className="section-title">Key Members</h3>
          <button className="text-primary font-label-caps text-label-caps flex items-center gap-1">
            View All <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
        <div className="space-y-sm">
          {cluster.members.map((member) => (
            <div key={member.id} className="card p-sm flex items-center gap-md bg-surface-container-lowest">
              <div className={`w-12 h-12 rounded-full ${member.color} flex items-center justify-center font-h3-title text-h3-title`}>{member.avatar}</div>
              <div className="flex-1">
                <div className="font-body-md text-body-md text-on-surface font-semibold">{member.name}</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant">{member.craft} • {member.role}</div>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-caps text-label-caps">{member.share}%</div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.div variants={fadeUp}>
        <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-body-md text-body-md font-semibold py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">receipt_long</span> Manage Shared Ledger
        </button>
      </motion.div>
    </motion.div>
  );
}
