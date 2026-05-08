import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analyzeProduct } from '../lib/geminiApi';

export default function NewListing() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState('upload'); // upload | analyzing | result
  const [aiResult, setAiResult] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStep('analyzing');
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result;
        const result = await analyzeProduct(base64String);
        setAiResult(result);
        setStep('result');
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container space-y-lg">
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-xs text-on-surface-variant mb-xs">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span><span className="font-body-md text-body-md">Back</span>
        </button>
        <h2 className="font-h1-display text-h1-display text-on-surface">New Listing</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">AI-powered product listing / एआई-संचालित उत्पाद सूची</p>
      </div>

      {step === 'upload' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-lg">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-square max-h-[300px] border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-md hover:bg-surface-container-low transition-colors cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[32px]">add_a_photo</span>
            </div>
            <div className="text-center">
              <p className="font-body-md text-body-md font-semibold text-on-surface">Upload Product Photo</p>
              <p className="font-label-caps text-label-caps text-on-surface-variant mt-xs">उत्पाद की फोटो अपलोड करें</p>
            </div>
          </button>
          <div className="card p-md flex items-center gap-md">
            <span className="material-symbols-outlined text-primary filled">auto_awesome</span>
            <div>
              <p className="font-body-md text-body-md font-semibold text-on-surface">AI Auto-Fill</p>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Gemini Vision will analyze your product photo and auto-generate title, category, tags, and suggested price.</p>
            </div>
          </div>
        </motion.div>
      )}

      {step === 'analyzing' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-lg">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-on-primary text-[40px] filled">auto_awesome</span>
          </div>
          <div className="text-center">
            <p className="font-h3-title text-h3-title text-on-surface">AI is analyzing...</p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-sm">एआई आपके उत्पाद का विश्लेषण कर रहा है</p>
          </div>
          <div className="w-48 h-1.5 bg-surface-variant rounded-full overflow-hidden">
            <motion.div className="h-full gradient-primary rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2.5 }} />
          </div>
        </motion.div>
      )}

      {step === 'result' && aiResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-lg">
          <div className="card p-md flex items-center gap-sm bg-sage/10 border-sage/30">
            <span className="material-symbols-outlined text-sage filled">check_circle</span>
            <p className="font-body-md text-body-md text-sage font-semibold">AI Analysis Complete!</p>
          </div>
          <div className="space-y-md">
            {[
              { label: 'Product Title', value: aiResult.title, sub: aiResult.titleHi },
              { label: 'Category', value: aiResult.category },
              { label: 'Craft Type', value: aiResult.craftType },
              { label: 'Suggested Price', value: `₹${aiResult.suggestedPrice}` },
            ].map((f) => (
              <div key={f.label}>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-xs block">{f.label}</label>
                <input className="input-field" defaultValue={f.value} />
                {f.sub && <p className="font-label-caps text-label-caps text-on-surface-variant mt-xs">{f.sub}</p>}
              </div>
            ))}
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-xs block">Tags</label>
              <div className="flex flex-wrap gap-xs">
                {aiResult.tags.map((t) => <span key={t} className="chip bg-primary-fixed/50 text-primary px-md py-1">{t}</span>)}
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/listings')} className="btn-primary-full">
            <span className="material-symbols-outlined">publish</span> Publish Listing
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
