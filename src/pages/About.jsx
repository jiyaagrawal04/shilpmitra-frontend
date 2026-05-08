import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const impacts = [
  { num: '500+', label: 'कारीगर जुड़े', sub: 'Artisans onboarded', icon: 'people' },
  { num: '₹12L+', label: 'फंडिंग अनलॉक', sub: 'Funding unlocked', icon: 'currency_rupee' },
  { num: '3', label: 'योजनाएं ट्रैक', sub: 'Schemes tracked', icon: 'verified' },
  { num: '5+', label: 'भाषाएं समर्थित', sub: 'Languages supported', icon: 'translate' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-surface">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px] filled">auto_awesome</span>
            </div>
            <span className="font-heading text-title font-bold text-primary">शिल्पमित्र</span>
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary !py-2 !px-4 !text-body-sm !min-h-0 !rounded-lg">Dashboard</button>
        </div>
      </nav>

      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {/* Mission */}
        <motion.section variants={fadeUp} className="text-center">
          <p className="text-overline text-accent uppercase tracking-widest mb-4">Our Mission</p>
          <h1 className="font-display text-display-lg md:text-display-xl text-on-surface mb-4">
            Making Government Funding <br /><span className="text-gradient">Reach the Last Artisan.</span>
          </h1>
          <p className="font-hindi text-headline text-on-surface/80 mb-4">सरकारी फंडिंग को अंतिम कारीगर तक पहुँचाना।</p>
          <p className="font-body text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            40% of eligible artisans never apply for schemes they qualify for. Not because they aren't worthy — but because no one told them. ShilpMitra changes that with AI.
          </p>
        </motion.section>

        {/* Problem */}
        <motion.section variants={fadeUp}>
          <div className="gradient-hero rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
            <h2 className="font-display text-display mb-6">The Problem in Three Numbers</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { num: '40%', label: 'पात्र कारीगर कभी आवेदन नहीं करते', sub: 'Eligible artisans never apply — don\'t know the scheme exists' },
                { num: '40%', label: 'आवेदन अस्वीकृत — एक दस्तावेज़ गायब', sub: 'Apply and get rejected — one missing document' },
                { num: '30%', label: 'फंडेड मशीनरी बेकार — कार्यशील पूंजी नहीं', sub: 'Funded machinery sits idle — no working capital' },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="font-display text-display-lg text-accent">{s.num}</div>
                  <p className="font-hindi text-body font-medium text-white/90 mt-2">{s.label}</p>
                  <p className="text-body-sm text-white/60 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* AI for Bharat */}
        <motion.section variants={fadeUp} className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 gradient-accent rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[28px] filled">smart_toy</span>
            </div>
            <div>
              <h2 className="font-display text-headline text-on-surface">AI for Bharat</h2>
              <p className="font-hindi text-body text-on-surface-variant">भारत के लिए AI</p>
            </div>
          </div>
          <div className="space-y-4 font-body text-body text-on-surface-variant">
            <p>ShilpMitra is not a chatbot. It's an <strong className="text-primary">action agent</strong> that watches your daily sales and <strong className="text-primary">takes action</strong> when you become eligible for funding.</p>
            <p>The AI doesn't answer questions — it <strong className="text-accent">monitors data and acts</strong>. Every sale the artisan makes builds the evidence the government needs to fund them — automatically.</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-error-container/50 rounded-xl p-4">
                <p className="font-heading text-body font-semibold text-error mb-2">Government Portal Today ❌</p>
                <ul className="text-body-sm text-on-surface-variant space-y-1">
                  <li>• Must know scheme exists</li>
                  <li>• Read English criteria</li>
                  <li>• Gather documents manually</li>
                  <li>• Gets rejected, no explanation</li>
                </ul>
              </div>
              <div className="bg-success-container/50 rounded-xl p-4">
                <p className="font-heading text-body font-semibold text-success mb-2">ShilpMitra AI ✅</p>
                <ul className="text-body-sm text-on-surface-variant space-y-1">
                  <li>• Agent watches sales data</li>
                  <li>• Detects eligibility auto</li>
                  <li>• Notifies in their language</li>
                  <li>• Pre-fills documents</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Impact */}
        <motion.section variants={fadeUp}>
          <div className="text-center mb-8">
            <p className="text-overline text-accent uppercase tracking-widest mb-2">Impact</p>
            <h2 className="font-display text-display text-on-surface">Our Numbers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {impacts.map((m, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-primary-container flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">{m.icon}</span>
                </div>
                <div className="font-display text-headline text-primary">{m.num}</div>
                <p className="font-hindi text-body-sm text-on-surface mt-1">{m.label}</p>
                <p className="text-caption text-on-surface-variant">{m.sub}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section variants={fadeUp} className="text-center">
          <button onClick={() => navigate('/dashboard')} className="btn-primary !rounded-2xl !px-8 !py-4 !text-body-lg">
            <span className="material-symbols-outlined">rocket_launch</span> Join ShilpMitra Today
          </button>
        </motion.section>
      </motion.div>
    </div>
  );
}
