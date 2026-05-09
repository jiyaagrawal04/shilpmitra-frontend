import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { getProducts } from '../lib/api';
import useAppStore from '../store/appStore';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function Listings() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { currentUser } = useAppStore();

  const { data: allProducts, loading } = useSupabaseData(
    () => getProducts({ sellerId: currentUser.id }),
    [currentUser.id],
    []
  );

  const myProducts = allProducts || [];
  const live = myProducts.filter((p) => (p.status === 'live' || p.is_active)).length;
  const pending = myProducts.filter((p) => p.status === 'review' || (!p.is_active && p.status !== 'live')).length;

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>
          📦 {t('sell.yourListings')}
        </h1>
        <button onClick={() => navigate('/listings/new')} 
          className="self-start px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1F3C88] to-[#4A90E2] text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md">
          ➕ {t('sell.newListing')}
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="flex gap-3 mb-6">
        {[
          { val: myProducts.length, label: t('common.total'), color: 'text-[#1F3C88]' },
          { val: live, label: t('common.active'), color: 'text-emerald-600' },
          { val: pending, label: t('common.pending'), color: 'text-slate-400' },
        ].map((s, i) => (
          <div key={i} className="flex-1 bg-white rounded-xl border border-slate-100 p-4 text-center">
            <div className={`text-xl font-bold ${s.color}`} style={{ fontFamily: 'Sora, sans-serif' }}>{s.val}</div>
            <div className="text-[11px] text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-3 border-[#4A90E2] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 mt-3">{t('common.loading')}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && myProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3 opacity-50">📦</div>
          <p className="text-sm text-slate-400 mb-4">{lang === 'hi' ? 'कोई उत्पाद नहीं मिला' : 'No products listed yet'}</p>
          <button onClick={() => navigate('/listings/new')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1F3C88] to-[#4A90E2] text-white text-sm font-semibold">
            ➕ {t('sell.newListing')}
          </button>
        </div>
      )}

      {/* Product Cards */}
      <div className="space-y-3">
        {myProducts.map((product) => (
          <motion.div key={product.id} variants={fadeUp} 
            className="bg-white rounded-xl border border-slate-100 p-4 flex gap-4 hover:shadow-md hover:border-slate-200 transition-all">
            <div className="w-[100px] h-[120px] shrink-0 rounded-xl overflow-hidden bg-slate-50">
              {(product.image || product.photo_url) ? (
                <img src={product.image || product.photo_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#EAF4FF] to-[#e0f9f9]">
                  <span className="text-3xl opacity-50">🎨</span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{product.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-semibold ${
                    (product.status === 'live' || product.is_active) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {(product.status === 'live' || product.is_active) ? '● Live' : '○ Review'}
                  </span>
                </div>
                <div className="text-base font-bold text-[#1F3C88] mt-1" style={{ fontFamily: 'Sora, sans-serif' }}>₹{Number(product.price).toLocaleString()}</div>
                {(product.verified || product.is_active) && (
                  <span className="inline-block text-[10px] font-semibold text-emerald-600 mt-1">✓ {t('sell.aiVerified')}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-50">
                <button className="text-[12px] text-slate-400 hover:text-[#4A90E2] transition-colors font-medium">
                  ✏️ {t('sell.editListing')}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
