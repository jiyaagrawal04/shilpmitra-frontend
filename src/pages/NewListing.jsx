import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analyzeProduct } from '../lib/geminiApi';
import { createProduct } from '../lib/api';
import useAppStore from '../store/appStore';

export default function NewListing() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState('upload');
  const [aiResult, setAiResult] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const { currentUser } = useAppStore();

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStep('analyzing');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = await analyzeProduct(reader.result);
      setAiResult({ ...result, photoDataUrl: reader.result });
      setStep('result');
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!aiResult || publishing) return;
    setPublishing(true);
    try {
      await createProduct({
        seller_id: currentUser.id,
        title: aiResult.title,
        description: aiResult.description || `${aiResult.title} — handcrafted ${aiResult.craftType || 'artisan product'}`,
        craft_type: aiResult.craftType || aiResult.category,
        category: aiResult.category,
        material: aiResult.material || '',
        region: aiResult.region || currentUser.location || '',
        tags: aiResult.tags || [],
        price: Number(aiResult.suggestedPrice) || 0,
        photo_url: aiResult.photoUrl || '',
        is_active: true,
      });
      navigate('/listings');
    } catch (e) {
      console.error('[NewListing] Publish failed:', e);
      setPublishing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 sm:px-6 lg:px-8 py-8 space-y-6 max-w-2xl mx-auto">
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-on-surface-variant mb-2">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="text-body-sm">Back</span>
        </button>
        <h1 className="font-display text-display text-primary">नई लिस्टिंग</h1>
        <p className="font-body text-body text-on-surface-variant">AI-powered product listing • एआई-संचालित</p>
      </div>

      {step === 'upload' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square max-h-[280px] border-2 border-dashed border-primary-light/40 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-primary-container/30 transition-all cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-[32px]">add_a_photo</span>
            </div>
            <div className="text-center">
              <p className="font-heading text-body font-semibold text-on-surface">Upload Product Photo</p>
              <p className="text-caption text-on-surface-variant mt-1">उत्पाद की फोटो अपलोड करें</p>
            </div>
          </button>
          <div className="card p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white filled text-[20px]">auto_awesome</span>
            </div>
            <div>
              <p className="font-heading text-body font-semibold text-on-surface">AI Auto-Fill</p>
              <p className="text-body-sm text-on-surface-variant mt-1">Gemini Vision will analyze your product photo and suggest title, category, tags, and price.</p>
              <p className="font-hindi text-caption text-primary-light mt-1">AI स्वचालित रूप से शीर्षक, श्रेणी और कीमत सुझाएगा</p>
            </div>
          </div>
          <div className="card p-4 border-l-4 border-accent bg-accent-light/30">
            <p className="text-overline text-accent mb-2">AI ASSISTANT PREVIEW</p>
            <div className="space-y-2 text-body-sm text-on-surface-variant">
              <p>📸 "Detected: <strong className="text-on-surface">Handloom Textile</strong>"</p>
              <p>💰 "Suggested price: <strong className="text-on-surface">₹2,300</strong>"</p>
              <p>✅ "Eligible craft under <strong className="text-primary">PM Vishwakarma</strong>"</p>
            </div>
          </div>
        </motion.div>
      )}

      {step === 'analyzing' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center animate-pulse shadow-glow-accent">
            <span className="material-symbols-outlined text-white text-[40px] filled">auto_awesome</span>
          </div>
          <div className="text-center">
            <p className="font-heading text-title text-on-surface">AI is analyzing...</p>
            <p className="font-hindi text-body text-on-surface-variant mt-2">एआई आपके उत्पाद का विश्लेषण कर रहा है</p>
          </div>
          <div className="w-48 h-2 bg-outline-variant/30 rounded-full overflow-hidden">
            <motion.div className="h-full gradient-accent rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2.5 }} />
          </div>
        </motion.div>
      )}

      {step === 'result' && aiResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="card p-4 flex items-center gap-2 bg-success-container/50 border-success/20">
            <span className="material-symbols-outlined text-success filled">check_circle</span>
            <p className="font-heading text-body text-success font-semibold">AI Analysis Complete!</p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Product Title', value: aiResult.title, sub: aiResult.titleHi },
              { label: 'Category', value: aiResult.category },
              { label: 'Craft Type', value: aiResult.craftType },
              { label: 'Suggested Price', value: `₹${aiResult.suggestedPrice}` },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-overline text-on-surface-variant mb-1 block">{f.label}</label>
                <input className="input-field" defaultValue={f.value} 
                  onChange={e => { aiResult[f.label === 'Product Title' ? 'title' : f.label === 'Suggested Price' ? 'suggestedPrice' : f.label === 'Craft Type' ? 'craftType' : 'category'] = e.target.value.replace('₹', ''); }} />
                {f.sub && <p className="font-hindi text-caption text-on-surface-variant mt-1">{f.sub}</p>}
              </div>
            ))}
            <div>
              <label className="text-overline text-on-surface-variant mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {aiResult.tags.map((t) => <span key={t} className="chip bg-primary-container text-primary px-3 py-1">{t}</span>)}
              </div>
            </div>
          </div>
          <button onClick={handlePublish} disabled={publishing}
            className={`btn-primary-full flex items-center justify-center gap-2 ${publishing ? 'opacity-60' : ''}`}>
            {publishing ? (
              <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : (
              <><span className="material-symbols-outlined">publish</span> Publish Listing • प्रकाशित करें</>
            )}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
