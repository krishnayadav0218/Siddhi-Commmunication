import { useEffect, useMemo } from 'react';
import { useCart } from '../lib/cart';
import { useWishlist } from '../lib/useWishlist';
import { useRecentlyViewed } from '../lib/useRecentlyViewed';
import { useLanguage } from '../lib/LanguageContext';

export default function ProductQuickView({ product, allItems, contact, onClose, onOpenProduct }) {
  const { addItem, items } = useCart();
  const { toggle, isSaved } = useWishlist();
  const { recordView } = useRecentlyViewed();
  const { t } = useLanguage();

  useEffect(() => {
    if (product) recordView(product);
  }, [product?.id]);

  const related = useMemo(() => {
    if (!product) return [];
    return allItems
      .filter((it) => it.categoryKey === product.categoryKey && it.id !== product.id)
      .slice(0, 4);
  }, [product, allItems]);

  if (!product) return null;

  const inCart = items.find((p) => p.id === product.id);
  const saved = isSaved(product.name);
  const outOfStock = product.inStock === false;

  return (
    <div className="quickview-overlay" onClick={onClose}>
      <div className="quickview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cart-close quickview-close" onClick={onClose} aria-label="Close" type="button">
          ✕
        </button>

        <div className="quickview-body">
          <div className="quickview-media">
            <span className="quickview-ic">{product.icon}</span>
            {outOfStock ? <span className="stock-badge stock-out">{t('outOfStock')}</span> : <span className="stock-badge stock-in">{t('inStock')}</span>}
          </div>
          <div className="quickview-info">
            <span className="quickview-category">{product.categoryLabel}</span>
            <h3>{product.name}</h3>
            {product.priceFrom ? <div className="quickview-price">From {product.priceFrom}</div> : null}

            <div className="quickview-actions">
              <button type="button" className="btn btn-primary" disabled={outOfStock} onClick={() => addItem(product, 1)}>
                {outOfStock ? t('unavailable') : inCart ? `🛒 ${t('inCart')} (${inCart.qty})` : `🛒 ${t('addToCart')}`}
              </button>
              <button
                type="button"
                className={`btn btn-ghost quickview-wish-btn${saved ? ' saved' : ''}`}
                onClick={() => toggle({ name: product.name, icon: product.icon, priceFrom: product.priceFrom })}
              >
                {saved ? '❤️' : '🤍'} {t('wishlist')}
              </button>
            </div>

            <a
              className="wa-mini quickview-wa"
              href={`https://wa.me/91${contact.phone1}?text=I%27m%20interested%20in%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noreferrer"
            >
              💬 {t('inquire')}
            </a>
          </div>
        </div>

        {related.length > 0 ? (
          <div className="quickview-related">
            <h4>{t('alsoBought')}</h4>
            <div className="quickview-related-grid">
              {related.map((it) => (
                <button key={it.id} type="button" className="quickview-related-card" onClick={() => onOpenProduct(it)}>
                  <span>{it.icon}</span>
                  <div className="quickview-related-name">{it.name}</div>
                  {it.priceFrom ? <div className="quickview-related-price">{it.priceFrom}</div> : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
