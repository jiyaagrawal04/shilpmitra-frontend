import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products, categories } from '../data/demoData';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function Marketplace() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.status === 'live';
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="page-container space-y-md">
      <motion.h2 variants={fadeUp} className="font-h1-display text-h1-display text-on-surface">Marketplace <br/><span className="font-h2-headline text-h2-headline text-on-surface-variant">बाज़ार</span></motion.h2>

      {/* Search */}
      <motion.div variants={fadeUp} className="relative">
        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input className="input-field pl-12" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </motion.div>

      {/* Category Chips */}
      <motion.div variants={fadeUp} className="flex gap-sm overflow-x-auto hide-scrollbar pb-xs">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`chip whitespace-nowrap px-md py-2 rounded-full transition-colors ${activeCategory === cat ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}>
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-sm">
        {filtered.map((product) => (
          <motion.div key={product.id} variants={fadeUp} onClick={() => navigate(`/marketplace/${product.id}`)}
            className="card overflow-hidden cursor-pointer hover:shadow-md transition-shadow group">
            <div className="aspect-[3/4] bg-surface-variant overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px]">image</span>
                </div>
              )}
            </div>
            <div className="p-sm">
              <h3 className="font-body-md text-body-md font-semibold text-on-surface line-clamp-1">{product.title}</h3>
              <p className="font-body-md text-body-md text-primary font-bold mt-xs">₹{product.price.toLocaleString()}</p>
              <div className="flex items-center gap-xs mt-xs">
                {product.verified && <span className="material-symbols-outlined text-[14px] text-sage filled">verified</span>}
                <span className="font-label-caps text-label-caps text-on-surface-variant">{product.craft}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
