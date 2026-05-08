import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAppStore from '../store/appStore';
import { artisans, eligibilityChecks } from '../data/demoData';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, language, setLanguage } = useAppStore();
  const artisan = artisans.find((a) => a.id === currentUser.id) || artisans[0];

  const menuItems = [
    { icon: 'storefront', label: 'My Listings', labelHi: 'मेरे उत्पाद', to: '/listings' },
    { icon: 'receipt_long', label: 'Trade Ledger', labelHi: 'व्यापार लेज़र', to: '/ledger' },
    { icon: 'groups', label: 'My Cluster', labelHi: 'मेरा क्लस्टर', to: '/clusters' },
    { icon: 'account_balance', label: 'Scheme Navigator', labelHi: 'योजना नेविगेटर', to: '/schemes' },
    { icon: 'notifications', label: 'Notifications', labelHi: 'सूचनाएं', to: '/notifications' },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }} className="page-container space-y-lg pb-8">
      {/* Profile Card */}
      <motion.section variants={fadeUp} className="card p-lg flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-h1-display text-h1-display mb-md">
          {artisan.avatar}
        </div>
        <h2 className="font-h2-headline text-h2-headline text-on-surface">{artisan.name}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">{artisan.nameHi}</p>
        <div className="flex items-center gap-sm mt-sm">
          <span className="chip bg-primary-fixed text-primary">{artisan.craft}</span>
          <span className="chip bg-surface-container-high text-on-surface-variant">{artisan.location}</span>
        </div>
        {artisan.verified && (
          <div className="flex items-center gap-xs mt-md text-sage">
            <span className="material-symbols-outlined filled text-[16px]">verified</span>
            <span className="font-label-caps text-label-caps">Verified Artisan</span>
          </div>
        )}
      </motion.section>

      {/* Stats */}
      <motion.section variants={fadeUp} className="grid grid-cols-3 gap-sm">
        <div className="stat-card"><span className="font-h2-headline text-h2-headline text-primary">₹{(artisan.totalSales / 1000).toFixed(0)}K</span><span className="font-label-caps text-label-caps text-on-surface-variant mt-xs">Sales</span></div>
        <div className="stat-card"><span className="font-h2-headline text-h2-headline text-secondary-container">{artisan.activeOrders}</span><span className="font-label-caps text-label-caps text-on-surface-variant mt-xs">Orders</span></div>
        <div className="stat-card"><span className="font-h2-headline text-h2-headline text-primary">{artisan.fundingEligibility}%</span><span className="font-label-caps text-label-caps text-on-surface-variant mt-xs">Eligible</span></div>
      </motion.section>

      {/* Language */}
      <motion.section variants={fadeUp} className="card p-md">
        <h3 className="section-title mb-md">Language / भाषा</h3>
        <div className="flex gap-sm">
          {['en', 'hi', 'kn'].map((l) => (
            <button key={l} onClick={() => setLanguage(l)}
              className={`flex-1 py-3 rounded-lg font-label-caps text-label-caps transition-colors ${language === l ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}>
              {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'ಕನ್ನಡ'}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Menu */}
      <motion.section variants={fadeUp} className="card overflow-hidden">
        {menuItems.map((item, i) => (
          <button key={item.to} onClick={() => navigate(item.to)}
            className={`w-full p-md flex items-center gap-md hover:bg-surface-container-low transition-colors ${i < menuItems.length - 1 ? 'border-b border-outline-variant/20' : ''}`}>
            <span className="material-symbols-outlined text-primary">{item.icon}</span>
            <div className="text-left flex-1">
              <p className="font-body-md text-body-md text-on-surface">{item.label}</p>
              <p className="font-label-caps text-label-caps text-on-surface-variant">{item.labelHi}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
        ))}
      </motion.section>
    </motion.div>
  );
}
