import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { transactions } from '../data/demoData';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Dashboard() {
  const navigate = useNavigate();
  const recentTx = transactions.slice(0, 3);

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="page-container space-y-md">
      {/* Welcome */}
      <motion.section variants={fadeUp} className="mb-lg">
        <h2 className="font-h1-display text-h1-display text-primary">Namaste, Raju!</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">नमस्ते राजू! | ನಮಸ್ತೆ ರಾಜು!</p>
      </motion.section>

      {/* Funding Eligibility */}
      <motion.section variants={fadeUp} className="card p-lg">
        <div className="flex flex-col md:flex-row items-center gap-lg">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="text-surface-variant" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
              <circle className="text-primary" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"
                strokeDasharray="251.2" strokeDashoffset="50.24" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-h3-title text-h3-title text-primary">80%</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="section-title mb-sm">Funding Eligibility</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">You are 80% ready for the PM Vishwakarma scheme. Complete your profile to apply.</p>
            <button onClick={() => navigate('/schemes')} className="btn-primary w-full md:w-auto">
              <span className="material-symbols-outlined">assignment</span> Check New Schemes
            </button>
          </div>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <motion.section variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-sm">
        <div className="stat-card min-h-[100px]">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Total Sales</p>
          <p className="font-h2-headline text-h2-headline text-primary">₹45,200</p>
        </div>
        <div className="stat-card min-h-[100px]">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Active Orders</p>
          <p className="font-h2-headline text-h2-headline text-primary">3</p>
        </div>
        <div className="stat-card min-h-[100px] col-span-2 md:col-span-1">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Trade Growth</p>
          <div className="flex items-center gap-xs text-secondary-container">
            <span className="material-symbols-outlined">trending_up</span>
            <p className="font-h2-headline text-h2-headline">+12%</p>
          </div>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section variants={fadeUp} className="grid grid-cols-2 gap-sm">
        <button onClick={() => navigate('/listings')} className="card p-md flex items-center gap-md hover:bg-surface-container-low transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined">storefront</span></div>
          <div className="text-left"><p className="font-body-md text-body-md font-semibold text-on-surface">My Listings</p><p className="font-label-caps text-label-caps text-on-surface-variant">मेरे उत्पाद</p></div>
        </button>
        <button onClick={() => navigate('/ledger')} className="card p-md flex items-center gap-md hover:bg-surface-container-low transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined">receipt_long</span></div>
          <div className="text-left"><p className="font-body-md text-body-md font-semibold text-on-surface">Trade Ledger</p><p className="font-label-caps text-label-caps text-on-surface-variant">व्यापार लेज़र</p></div>
        </button>
      </motion.section>

      {/* Recent Activity */}
      <motion.section variants={fadeUp} className="card overflow-hidden mb-xl">
        <div className="p-md border-b border-surface-variant"><h3 className="section-title">Recent Activity</h3></div>
        <div className="divide-y divide-surface-variant">
          {recentTx.map((tx) => (
            <div key={tx.id} className="p-md flex items-center justify-between hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <div>
                  <p className="font-body-md text-body-md font-semibold text-on-surface">{tx.product}</p>
                  <p className="font-label-caps text-label-caps text-on-surface-variant">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • UPI</p>
                </div>
              </div>
              <p className="font-h3-title text-h3-title text-primary">+₹{tx.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="p-sm text-center border-t border-surface-variant bg-surface-container-low">
          <button onClick={() => navigate('/ledger')} className="font-label-caps text-label-caps text-primary hover:underline py-2 px-4 rounded min-h-[48px]">VIEW ALL TRANSACTIONS</button>
        </div>
      </motion.section>
    </motion.div>
  );
}
