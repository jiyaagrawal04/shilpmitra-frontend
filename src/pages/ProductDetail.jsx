import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products, artisans } from '../data/demoData';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  if (!product) return <div className="page-container pt-8 text-center">Product not found</div>;
  const seller = artisans.find((a) => a.id === product.sellerId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
      {/* Image */}
      <div className="relative aspect-[3/4] max-h-[60vh] bg-surface-variant">
        {product.image ? (
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-[80px] text-on-surface-variant">image</span></div>
        )}
        <button onClick={() => navigate(-1)} className="absolute top-safe-margin left-safe-margin w-10 h-10 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-on-surface shadow-sm">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        {product.verified && (
          <div className="absolute top-safe-margin right-safe-margin bg-sage/90 text-white px-3 py-1 rounded-full flex items-center gap-1 font-label-caps text-label-caps">
            <span className="material-symbols-outlined text-[14px] filled">verified</span> Heritage Verified
          </div>
        )}
      </div>

      <div className="page-container space-y-lg -mt-6 relative z-10">
        <div className="card p-lg space-y-md">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-h1-display text-h1-display text-on-surface">{product.title}</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">{product.titleHi}</p>
            </div>
            <p className="font-h2-headline text-h2-headline text-primary">₹{product.price.toLocaleString()}</p>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">{product.description}</p>
          <div className="flex flex-wrap gap-xs">
            {product.tags.map((tag) => <span key={tag} className="chip bg-primary-fixed/50 text-primary">{tag}</span>)}
          </div>
          {seller && (
            <div className="flex items-center gap-md p-md bg-surface-container-low rounded-xl mt-md">
              <div className={`w-10 h-10 rounded-full ${seller.color} flex items-center justify-center font-h3-title text-h3-title`}>{seller.avatar}</div>
              <div>
                <p className="font-body-md text-body-md font-semibold text-on-surface">{seller.name}</p>
                <p className="font-label-caps text-label-caps text-on-surface-variant">{seller.craft} • {seller.location}</p>
              </div>
            </div>
          )}
        </div>
        <button className="btn-primary-full">
          <span className="material-symbols-outlined">shopping_cart</span> Buy Now
        </button>
      </div>
    </motion.div>
  );
}
