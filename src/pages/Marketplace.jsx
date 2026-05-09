import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { getProducts } from '../lib/api';
import { categories as demoCategories } from '../data/demoData';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const craftEmojis = { All: '🎨', Handloom: '🧵', Pottery: '🏺', Woodwork: '🪵', Jewelry: '💎' };

export default function Marketplace() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: products, loading } = useSupabaseData(
    () => getProducts(activeCategory !== 'All' ? { craftType: activeCategory } : {}),
    [activeCategory],
    []
  );

  const categories = demoCategories;

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>
            🛍️ {t('nav.marketplace')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'hi' ? 'हस्तशिल्प बाज़ार — सीधे कारीगरों से' : 'Handcraft marketplace — directly from artisans'}
          </p>
        </div>
        <button onClick={() => navigate('/listings/new')} 
          className="self-start px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1F3C88] to-[#4A90E2] text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md">
          ➕ {t('sell.listProduct')}
        </button>
      </motion.div>

      {/* Category Filters */}
      <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-6">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-[#1F3C88] to-[#4A90E2] text-white shadow-md'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-[#4A90E2]/30 hover:text-slate-700'
            }`}>
            <span>{craftEmojis[cat] || '🎨'}</span>
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-3 border-[#4A90E2] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 mt-3">{t('common.loading')}</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && (
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(products || []).map(product => (
            <motion.div key={product.id} variants={fadeUp}
              onClick={() => navigate(`/marketplace/${product.id}`)}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden cursor-pointer group hover:shadow-lg hover:border-slate-200 transition-all duration-300">
              
              {/* Image */}
              <div className="aspect-square bg-slate-50 relative overflow-hidden">
                {(product.image || product.photo_url) ? (
                  <img src={product.image || product.photo_url} alt={product.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#EAF4FF] to-[#e0f9f9]">
                    <span className="text-5xl opacity-60">{craftEmojis[product.craft || product.craft_type] || '🎨'}</span>
                  </div>
                )}
                {(product.verified || product.is_active) && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                    ✓ AI Verified
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{product.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{product.titleHi || product.description?.substring(0, 40) || ''}</p>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-base font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>₹{Number(product.price).toLocaleString()}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 font-medium">{product.craft || product.craft_type}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty */}
      {!loading && (products || []).length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3 opacity-50">🛍️</div>
          <p className="text-sm text-slate-400">{lang === 'hi' ? 'कोई उत्पाद नहीं मिला' : 'No products found'}</p>
        </div>
      )}
    </motion.div>
  );
}
