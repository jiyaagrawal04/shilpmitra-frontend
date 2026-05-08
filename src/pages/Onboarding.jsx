import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function Onboarding() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('hi');
  const [name, setName] = useState('');
  const [craft, setCraft] = useState('');

  const languages = [
    { id: 'hi', label: 'हिन्दी', char: 'अ' },
    { id: 'en', label: 'English', char: 'A' },
    { id: 'kn', label: 'ಕನ್ನಡ', char: 'ಅ' },
  ];

  const crafts = [
    { id: 'pottery', label: 'Pottery', labelHi: 'मिट्टी के बर्तन', emoji: '🏺' },
    { id: 'handloom', label: 'Handloom', labelHi: 'हथकरघा', emoji: '🧵' },
    { id: 'woodwork', label: 'Carpentry', labelHi: 'बढ़ई', emoji: '🪵' },
    { id: 'leather', label: 'Leather', labelHi: 'चमड़ा', emoji: '👜' },
    { id: 'weaving', label: 'Weaving', labelHi: 'बुनाई', emoji: '🧶' },
    { id: 'blacksmith', label: 'Blacksmithing', labelHi: 'लोहारी', emoji: '⚒️' },
    { id: 'embroidery', label: 'Embroidery', labelHi: 'कढ़ाई', emoji: '🪡' },
    { id: 'block-print', label: 'Block Print', labelHi: 'ब्लॉक प्रिंट', emoji: '🖨️' },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="min-h-screen gradient-surface flex flex-col items-center pb-safe-margin">
      <div className="w-full max-w-md mx-auto pt-4 px-safe-margin flex-grow flex flex-col gap-6">

        {/* Hero */}
        <motion.section variants={fadeUp} className="gradient-hero rounded-3xl overflow-hidden relative h-[200px] flex items-end p-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-4 right-4 w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center animate-float">
            <span className="material-symbols-outlined text-white text-[32px] filled">auto_awesome</span>
          </div>
          <div className="text-white relative z-10">
            <h1 className="font-display text-display-lg mb-1">नमस्ते 🙏</h1>
            <p className="font-body text-body-lg text-white/80">Welcome to ShilpMitra</p>
            <p className="text-caption text-white/50">India's AI-Powered Artisan Funding Platform</p>
          </div>
        </motion.section>

        {/* Language */}
        <motion.section variants={fadeUp} className="space-y-3">
          <h3 className="section-title">भाषा चुनें <span className="text-on-surface-variant font-normal text-body-sm">• Select Language</span></h3>
          <div className="grid grid-cols-3 gap-2">
            {languages.map((lang) => (
              <button key={lang.id} onClick={() => setSelectedLang(lang.id)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                  selectedLang === lang.id
                    ? 'bg-primary-container text-primary border-primary-light shadow-card'
                    : 'bg-white/70 text-on-surface-variant border-transparent hover:border-outline-variant'
                }`}>
                <span className="font-heading text-headline">{lang.char}</span>
                <span className="text-caption font-semibold">{lang.label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Profile */}
        <motion.section variants={fadeUp} className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary filled">person_add</span>
            <h3 className="section-title">कारीगर प्रोफ़ाइल</h3>
          </div>
          <input className="input-field" placeholder="पूरा नाम / Full Name" value={name} onChange={e => setName(e.target.value)} />

          <div>
            <p className="text-caption text-on-surface-variant mb-2">शिल्प चुनें / Select your craft</p>
            <div className="grid grid-cols-4 gap-2">
              {crafts.map(c => (
                <button key={c.id} onClick={() => setCraft(c.id)}
                  className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all text-center ${
                    craft === c.id
                      ? 'border-primary-light bg-primary-container'
                      : 'border-outline-variant/30 bg-white/50 hover:border-primary-light/40'
                  }`}>
                  <span className="text-xl mb-1">{c.emoji}</span>
                  <span className="text-[10px] font-medium text-on-surface leading-tight">{c.labelHi}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      {/* CTA */}
      <div className="w-full max-w-md mx-auto px-safe-margin py-4 sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent z-40 mt-6">
        <button onClick={() => navigate('/dashboard')} className="btn-primary-full">
          आगे बढ़ें • Continue <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}
