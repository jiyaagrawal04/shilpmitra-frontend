import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products } from '../data/demoData';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function Listings() {
  const navigate = useNavigate();
  const myProducts = products.filter((p) => p.sellerId === 'a1');
  const live = myProducts.filter((p) => p.status === 'live').length;
  const pending = myProducts.filter((p) => p.status !== 'live').length;

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }} className="page-container space-y-lg">
      <motion.section variants={fadeUp}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-xs text-on-surface-variant mb-xs">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span><span className="font-body-md text-body-md">Back</span>
        </button>
        <h2 className="font-h1-display text-h1-display text-on-surface">My Listings <br/><span className="font-h2-headline text-h2-headline text-on-surface-variant">मेरे उत्पाद</span></h2>
      </motion.section>

      {/* Stats */}
      <motion.section variants={fadeUp} className="flex gap-sm">
        {[{ val: myProducts.length, label: 'Total\nकुल', color: 'text-primary' }, { val: live, label: 'Active\nसक्रिय', color: 'text-secondary-container' }, { val: pending, label: 'Pending\nलंबित', color: 'text-outline' }].map((s, i) => (
          <div key={i} className="stat-card flex-1">
            <span className={`font-h2-headline text-h2-headline ${s.color}`}>{s.val}</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant mt-xs text-center whitespace-pre-line">{s.label}</span>
          </div>
        ))}
      </motion.section>

      {/* Product Cards */}
      <section className="flex flex-col gap-md">
        {myProducts.map((product) => (
          <motion.div key={product.id} variants={fadeUp} className="card p-sm flex gap-md items-stretch">
            <div className="w-[100px] h-[120px] shrink-0 rounded-lg overflow-hidden bg-surface-variant">
              {product.image ? <img src={product.image} alt={product.title} className="w-full h-full object-cover" /> : (
                <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-[32px] text-on-surface-variant">image</span></div>
              )}
            </div>
            <div className="flex flex-col justify-between py-xs pr-sm flex-1">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-h3-title text-h3-title text-on-surface line-clamp-1">{product.title}</h3>
                  <span className={`font-label-caps text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${product.status === 'live' ? 'bg-secondary-container/20 text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                    {product.status.toUpperCase()}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-primary font-bold mt-xs">₹{product.price.toLocaleString()}</p>
                {product.verified && (
                  <div className="flex items-center gap-xs mt-sm">
                    <span className="material-symbols-outlined text-[16px] text-tertiary-container filled">verified</span>
                    <span className="font-label-caps text-label-caps text-tertiary-container">Heritage Verified</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-sm mt-md pt-sm border-t border-outline-variant/20">
                <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors flex-1 justify-center">
                  <span className="material-symbols-outlined text-[18px]">edit</span><span className="font-label-caps text-label-caps">Edit</span>
                </button>
                <div className="w-px h-4 bg-outline-variant/50"></div>
                <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors flex-1 justify-center">
                  <span className="material-symbols-outlined text-[18px]">bar_chart</span><span className="font-label-caps text-label-caps">Stats</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* FAB */}
      <button onClick={() => navigate('/listings/new')} className="fixed bottom-[100px] right-safe-margin w-[56px] h-[56px] bg-primary text-on-primary rounded-xl shadow-[0_4px_20px_rgba(21,21,125,0.3)] flex items-center justify-center hover:scale-95 transition-transform z-40">
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </motion.div>
  );
}
