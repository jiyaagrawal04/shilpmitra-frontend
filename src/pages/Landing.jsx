import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAppStore from '../store/appStore';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => { start += step; if (start >= target) { setCount(target); clearInterval(timer); } else setCount(start); }, 40);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}{suffix}</>;
}

const features = [
  { icon: 'psychology', title: 'AI Eligibility Detection', titleHi: 'AI पात्रता पहचान', desc: 'Automatically detects which schemes you qualify for based on your sales data' },
  { icon: 'receipt_long', title: 'Auto Trade Ledger', titleHi: 'स्वचालित व्यापार बही', desc: 'Every sale creates a verified financial record — government-ready proof' },
  { icon: 'account_balance', title: 'Scheme Tracking', titleHi: 'योजना ट्रैकिंग', desc: 'Real-time monitoring of PM Vishwakarma, MUDRA, SFURTI and more' },
  { icon: 'translate', title: 'Local Language', titleHi: 'स्थानीय भाषा', desc: 'Guidance in Hindi, Kannada, and other Indian languages' },
  { icon: 'groups', title: 'Cluster Formation', titleHi: 'क्लस्टर निर्माण', desc: 'Group artisans for SFURTI ₹8 crore cluster grants' },
  { icon: 'picture_as_pdf', title: 'Auto-generated PDFs', titleHi: 'स्वचालित PDF', desc: 'Bank-ready trade records and eligibility documents' },
  { icon: 'notifications_active', title: 'Smart Notifications', titleHi: 'स्मार्ट सूचनाएं', desc: 'Proactive alerts when you become eligible or documents expire' },
  { icon: 'auto_awesome', title: 'AI Categorization', titleHi: 'AI वर्गीकरण', desc: 'Upload a photo — AI detects craft type, suggests pricing and tags' },
];

const steps = [
  { num: '01', title: 'Upload Product', titleHi: 'उत्पाद अपलोड करें', icon: 'add_photo_alternate' },
  { num: '02', title: 'AI Detects Craft', titleHi: 'AI शिल्प पहचानता है', icon: 'auto_awesome' },
  { num: '03', title: 'Product Sold', titleHi: 'उत्पाद बिका', icon: 'shopping_cart' },
  { num: '04', title: 'Ledger Created', titleHi: 'बही-खाता बना', icon: 'receipt_long' },
  { num: '05', title: 'AI Monitors', titleHi: 'AI निगरानी करता है', icon: 'monitoring' },
  { num: '06', title: 'Notification Sent', titleHi: 'सूचना भेजी', icon: 'notifications' },
  { num: '07', title: 'Funding Unlocked', titleHi: 'फंडिंग अनलॉक!', icon: 'lock_open' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { language, setLanguage } = useAppStore();

  return (
    <div className="min-h-screen gradient-surface">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px] filled">auto_awesome</span>
            </div>
            <span className="font-heading text-title font-bold text-primary">शिल्पमित्र</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="w-9 h-9 text-primary-light hover:bg-primary-container transition-colors rounded-xl flex items-center justify-center" title={language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}>
              <span className="material-symbols-outlined text-[20px]">translate</span>
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-ghost">Dashboard</button>
            <button onClick={() => navigate('/schemes')} className="btn-primary !py-2 !px-4 !text-body-sm !min-h-0 !rounded-lg">Check Eligibility</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <motion.section initial="hidden" animate="visible" variants={stagger} className="max-w-6xl mx-auto px-4 pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-caption font-semibold mb-6">
              <span className="material-symbols-outlined text-[16px] filled">bolt</span>
              India's First AI Artisan Funding Agent
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-display-lg md:text-display-xl text-on-surface mb-4 leading-tight">
              Your Sales Should <br /><span className="text-gradient">Unlock Your Future.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-hindi text-headline text-on-surface/80 mb-2">
              आपकी बिक्री आपका भविष्य खोलेगी।
            </motion.p>
            <motion.p variants={fadeUp} className="font-body text-body-lg text-on-surface-variant mb-8 max-w-lg">
              ShilpMitra automatically tracks artisan sales, detects government scheme eligibility, and guides funding applications — in your language.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/marketplace')} className="btn-primary !rounded-2xl !px-8 !py-4 !text-body-lg">
                <span className="material-symbols-outlined">storefront</span> Start Selling
              </button>
              <button onClick={() => navigate('/schemes')} className="btn-outline !rounded-2xl !px-8 !py-4 !text-body-lg">
                <span className="material-symbols-outlined">verified</span> Check Eligibility
              </button>
            </motion.div>
          </div>

          {/* Hero Visual */}
          <motion.div variants={fadeUp} className="relative hidden md:block">
            <div className="absolute -top-8 -right-8 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-primary-light/10 rounded-full blur-3xl" />
            <div className="relative glass-card rounded-3xl p-6 space-y-4 animate-float">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white filled text-[20px]">smart_toy</span>
                </div>
                <div>
                  <p className="font-heading text-body font-semibold text-on-surface">AI Agent Update</p>
                  <p className="text-caption text-on-surface-variant">Just now</p>
                </div>
              </div>
              {[
                { text: '✅ PM Vishwakarma — पात्र! Eligible!', color: 'bg-success-container border-success/20' },
                { text: '🏦 MUDRA Shishu — ₹50,000 ready', color: 'bg-primary-container border-primary-light/20' },
                { text: '📄 Trade Record PDF generated', color: 'bg-accent-light border-accent/20' },
              ].map((n, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.2 }}
                  className={`${n.color} border rounded-xl px-4 py-3 text-body-sm font-medium text-on-surface`}>
                  {n.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Stats ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-3 gap-4">
          {[
            { num: 40, suffix: '%', label: 'पात्र कारीगर कभी आवेदन नहीं करते', sub: 'Never apply', color: 'from-red-500 to-orange-500' },
            { num: 40, suffix: '%', label: 'आवेदन करने पर अस्वीकृत', sub: 'Get rejected', color: 'from-amber-500 to-yellow-500' },
            { num: 30, suffix: '%', label: 'फंडेड मशीनरी बेकार', sub: 'Machinery idle', color: 'from-orange-500 to-red-500' },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="card card-hover p-6 text-center">
              <div className={`font-display text-display font-extrabold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                <Counter target={s.num} suffix={s.suffix} />
              </div>
              <p className="font-hindi text-body-sm text-on-surface mt-2">{s.label}</p>
              <p className="text-caption text-on-surface-variant mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Features ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto px-4 pb-20">
        <motion.div variants={fadeUp} className="text-center mb-12">
          <p className="text-overline text-accent uppercase tracking-widest mb-2">Features</p>
          <h2 className="font-display text-display text-on-surface mb-2">Everything an Artisan Needs</h2>
          <p className="font-hindi text-headline text-on-surface-variant">कारीगर को जो चाहिए, सब कुछ</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp} className="card card-hover p-5 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors text-[24px]">{f.icon}</span>
              </div>
              <h3 className="font-heading text-body font-semibold text-on-surface mb-1">{f.title}</h3>
              <p className="font-hindi text-body-sm text-primary-light font-medium mb-2">{f.titleHi}</p>
              <p className="text-caption text-on-surface-variant">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── How It Works ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto px-4 pb-20">
        <motion.div variants={fadeUp} className="text-center mb-12">
          <p className="text-overline text-accent uppercase tracking-widest mb-2">How It Works</p>
          <h2 className="font-display text-display text-on-surface mb-2">From Sale to Funding</h2>
          <p className="font-hindi text-headline text-on-surface-variant">बिक्री से फंडिंग तक</p>
        </motion.div>
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary-light opacity-20" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="card p-4 text-center relative group hover:glow-blue transition-all duration-500">
                <div className="text-overline text-accent mb-2">{s.num}</div>
                <div className="w-12 h-12 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-[22px]">{s.icon}</span>
                </div>
                <p className="font-heading text-body-sm font-semibold text-on-surface">{s.title}</p>
                <p className="font-hindi text-caption text-on-surface-variant mt-1">{s.titleHi}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── CTA ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-4xl mx-auto px-4 pb-20">
        <div className="gradient-hero rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full translate-y-24 -translate-x-24" />
          <div className="relative z-10">
            <h2 className="font-display text-display md:text-display-lg mb-4">Ready to Unlock Government Funding?</h2>
            <p className="font-hindi text-headline text-white/80 mb-8">सरकारी फंडिंग पाने के लिए तैयार हैं?</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="bg-white text-primary font-heading text-body-lg font-bold py-4 px-8 rounded-2xl hover:shadow-float transition-all">
                🚀 Get Started Free
              </button>
              <button onClick={() => navigate('/about')} className="border-2 border-white/40 text-white font-heading text-body-lg font-semibold py-4 px-8 rounded-2xl hover:bg-white/10 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="glass-card border-t border-white/30 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px] filled">auto_awesome</span>
            </div>
            <span className="font-heading text-body font-bold text-primary">ShilpMitra</span>
          </div>
          <p className="font-hindi text-body-sm text-on-surface-variant mb-2">भारत का पहला AI-संचालित कारीगर फंडिंग प्लेटफ़ॉर्म</p>
          <p className="text-caption text-on-surface-variant">India's first AI-powered artisan funding operating system</p>
          <p className="text-caption text-outline mt-4">© 2025 ShilpMitra • Made with ❤️ for Bharat's Artisans</p>
        </div>
      </footer>
    </div>
  );
}
