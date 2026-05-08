import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products, artisans } from '../data/demoData';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  if (!product) return <div className="px-4 sm:px-6 lg:px-8 py-8 text-center font-heading text-body text-on-surface-variant">Product not found</div>;
  const seller = artisans.find((a) => a.id === product.sellerId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Image */}
      <div className="relative aspect-[3/4] max-h-[60vh] bg-surface-container">
        {product.image ? (
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-container to-accent-light">
            <span className="material-symbols-outlined text-[80px] text-primary-light/30">image</span>
          </div>
        )}
        <button onClick={() => navigate(-1)} className="absolute top-5 left-5 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-on-surface shadow-card">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        {product.verified && (
          <div className="absolute top-5 right-5 bg-success/90 text-white px-3 py-1 rounded-xl flex items-center gap-1 text-caption font-semibold">
            <span className="material-symbols-outlined text-[14px] filled">verified</span> AI Verified
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-4 -mt-6 relative z-10 max-w-3xl mx-auto">
        <div className="card p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-display text-headline text-on-surface">{product.title}</h1>
              <p className="font-hindi text-body text-on-surface-variant">{product.titleHi}</p>
            </div>
            <p className="font-display text-headline text-primary">₹{product.price.toLocaleString()}</p>
          </div>
          <p className="font-body text-body text-on-surface-variant">{product.description}</p>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => <span key={tag} className="chip bg-primary-container text-primary">{tag}</span>)}
          </div>
          {seller && (
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl mt-3 border border-outline-variant/20">
              <div className={`w-10 h-10 rounded-xl ${seller.color} flex items-center justify-center font-heading text-body`}>{seller.avatar}</div>
              <div>
                <p className="font-heading text-body font-semibold text-on-surface">{seller.name}</p>
                <p className="text-caption text-on-surface-variant">{seller.craft} • {seller.location}</p>
              </div>
            </div>
          )}
        </div>
        <button className="btn-primary-full">
          <span className="material-symbols-outlined">shopping_cart</span> Buy Now • अभी खरीदें
        </button>
      </div>
    </motion.div>
  );
}
