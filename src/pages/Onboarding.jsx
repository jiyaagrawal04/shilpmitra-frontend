import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('hi');
  const [name, setName] = useState('');
  const [craft, setCraft] = useState('');

  const languages = [
    { id: 'hi', label: 'हिन्दी', icon: 'language' },
    { id: 'en', label: 'English', char: 'A' },
    { id: 'kn', label: 'ಕನ್ನಡ', char: 'ಅ' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background flex flex-col items-center pb-safe-margin">
      <div className="w-full max-w-md mx-auto pt-4 px-safe-margin flex-grow flex flex-col gap-xl">
        {/* Hero */}
        <section className="w-full rounded-2xl overflow-hidden shadow-ambient relative h-[240px]">
          <img alt="Modern Indian Artisan" className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwna6_Zjy-YgHJ7Y5tZDfWnEUf7xKAiUtlIpT4pHt_naSyTRA5HEK8lJh8zSsvu4staCosU9gdkLhl4FzkjkErTCwoRwmOufuG2ERY4nKYkQLAUuyJdpvCVi182RMf-tobEoOiIH07iUNXsQvGYpfgMIY85ZPrWuoit_oUib81WXR48yWDYvxatJjO_PHSfpPaFifVgkGkbDjr_449JcCOVkhVmetswaaSNi9puo80WVBWVEFB06-dBZbT8q166-OOy9eo4csfT7mt" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-lg">
            <div className="text-on-primary">
              <h2 className="font-h1-display text-h1-display mb-sm">नमस्ते</h2>
              <p className="font-body-lg text-body-lg opacity-90">Welcome to ShilpMitra</p>
            </div>
          </div>
        </section>

        {/* Language Selection */}
        <section className="flex flex-col gap-md">
          <h3 className="section-title">Select Language / भाषा चुनें</h3>
          <div className="grid grid-cols-3 gap-sm">
            {languages.map((lang) => (
              <button key={lang.id} onClick={() => setSelectedLang(lang.id)}
                className={`flex flex-col items-center justify-center gap-sm p-md rounded-xl border-2 transition-all active:scale-95 ${
                  selectedLang === lang.id
                    ? 'bg-primary-container text-on-primary-container border-primary'
                    : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container-high'
                }`}>
                {lang.icon ? (
                  <span className={`material-symbols-outlined text-[32px] ${selectedLang === lang.id ? 'filled' : ''}`}>{lang.icon}</span>
                ) : (
                  <span className="font-h3-title text-h3-title">{lang.char}</span>
                )}
                <span className="font-label-caps text-label-caps font-bold">{lang.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Profile Setup */}
        <section className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-lg shadow-ambient border border-outline-variant/30 flex flex-col gap-lg">
          <div className="flex items-center gap-sm mb-xs">
            <span className="material-symbols-outlined text-primary filled">person_add</span>
            <h3 className="section-title">Artisan Profile Setup</h3>
          </div>
          <div className="relative">
            <input className="input-field placeholder-transparent peer" id="artisanName" placeholder="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <label className="absolute left-md top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant transition-all peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px] pointer-events-none" htmlFor="artisanName">Full Name / पूरा नाम</label>
          </div>
          <div className="relative">
            <select className="input-field appearance-none" value={craft} onChange={(e) => setCraft(e.target.value)}>
              <option value="" disabled>Select Craft / शिल्प चुनें</option>
              <option value="pottery">Pottery / मिट्टी के बर्तन</option>
              <option value="handloom">Handloom / हथकरघा</option>
              <option value="woodwork">Woodwork / लकड़ी का काम</option>
              <option value="jewelry">Jewelry / आभूषण</option>
            </select>
            <div className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-xs">
            {['Pottery', 'Handloom', 'Woodwork'].map((t) => (
              <span key={t} className="chip bg-secondary-container/20 text-on-secondary-container">{t}</span>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="w-full max-w-md mx-auto px-safe-margin py-md sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent z-40 mt-xl">
        <button onClick={() => navigate('/dashboard')} className="btn-primary-full">
          Continue <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}
