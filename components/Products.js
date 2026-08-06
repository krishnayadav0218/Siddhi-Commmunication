import { useMemo, useState } from 'react';
import Reveal from './Reveal';
import { useCart } from '../lib/cart';
import { useWishlist } from '../lib/useWishlist';
import { getProductId, parsePriceValue } from '../lib/productUtils';
import { useLanguage } from '../lib/LanguageContext';
import ProductQuickView from './ProductQuickView';
import RecentlyViewed from './RecentlyViewed';

function ShopCard({ item, contact, onOpen }) {
  const { addItem, items } = useCart();
  const { toggle, isSaved } = useWishlist();
  const { t } = useLanguage();
  const inCart = items.find((p) => p.id === item.id);
  const saved = isSaved(item.name);
  const outOfStock = item.inStock === false;

  return (
    <div className={`shop-card${outOfStock ? ' out-of-stock' : ''}`}>
      <button type="button" className="shop-card-media shop-card-media-btn" onClick={() => onOpen(item)} aria-label={`View ${item.name}`}>
        <span className="shop-card-ic">{item.icon}</span>
        {outOfStock ? (
          <span className="stock-badge stock-out">{t('outOfStock')}</span>
        ) : (
          <span className="stock-badge stock-in">{t('inStock')}</span>
        )}
      </button>
      <button
        type="button"
        className={`wishlist-heart${saved ? ' saved' : ''}`}
        onClick={() => toggle({ name: item.name, icon: item.icon, priceFrom: item.priceFrom })}
        aria-label={saved ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
      >
        {saved ? '❤️' : '🤍'}
      </button>
      <div className="shop-card-body">
        <button type="button" className="shop-card-title-btn" onClick={() => onOpen(item)}>
          <h4>{item.name}</h4>
        </button>
        {item.priceFrom ? <div className="p-price">From {item.priceFrom}</div> : null}
        <div className="shop-card-actions">
          <button
            type="button"
            className="btn-add-cart"
            disabled={outOfStock}
            onClick={() => addItem(item, 1)}
          >
            {outOfStock ? t('unavailable') : inCart ? `🛒 ${t('inCart')} (${inCart.qty})` : `🛒 ${t('addToCart')}`}
          </button>
          <a
            className="wa-mini"
            href={`https://wa.me/91${contact.phone1}?text=I%27m%20interested%20in%20${encodeURIComponent(item.name)}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            💬
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Products({ content }) {
  const { productCategories, contact } = content;
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('default');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [quickViewItem, setQuickViewItem] = useState(null);
  const { t } = useLanguage();

  const flatItems = useMemo(() => {
    const flat = [];
    productCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        flat.push({
          ...item,
          id: getProductId(cat.key, item.name),
          price: parsePriceValue(item.priceFrom),
          categoryKey: cat.key,
          categoryLabel: cat.label,
        });
      });
    });
    return flat;
  }, [productCategories]);

  const visibleItems = useMemo(() => {
    let list = flatItems;
    if (active !== 'all') list = list.filter((it) => it.categoryKey === active);
    if (inStockOnly) list = list.filter((it) => it.inStock !== false);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((it) => it.name.toLowerCase().includes(q) || it.categoryLabel.toLowerCase().includes(q));

    list = [...list];
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'stock') list.sort((a, b) => (b.inStock !== false) - (a.inStock !== false));

    return list;
  }, [flatItems, active, inStockOnly, query, sort]);

  function openProductById(partial) {
    const full = flatItems.find((it) => it.id === partial.id) || partial;
    setQuickViewItem(full);
  }

  return (
    <section id="accessories" className="section-pad">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Mobile Accessories Shop</span>
          <h2>Everything Your Phone Needs</h2>
          <p>Genuine protective gear, audio and charging accessories — filter, save to wishlist, or add straight to cart.</p>
        </Reveal>

        <div className="shop-toolbar">
          <div className="shop-search">
            <span>🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('search')}
            />
          </div>
          <select className="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
            <option value="default">{t('sortFeatured')}</option>
            <option value="price-asc">{t('sortPriceLow')}</option>
            <option value="price-desc">{t('sortPriceHigh')}</option>
            <option value="stock">{t('sortStock')}</option>
          </select>
          <label className="shop-stock-toggle">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            <span>{t('inStockOnly')}</span>
          </label>
        </div>

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <button
              type="button"
              className={`shop-cat-btn${active === 'all' ? ' active' : ''}`}
              onClick={() => setActive('all')}
            >
              {t('allAccessories')}
              <span className="shop-cat-count">{flatItems.length}</span>
            </button>
            {productCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className={`shop-cat-btn${active === cat.key ? ' active' : ''}`}
                onClick={() => setActive(cat.key)}
              >
                {cat.label}
                <span className="shop-cat-count">{cat.items.length}</span>
              </button>
            ))}
          </aside>

          <div className="shop-grid">
            {visibleItems.length === 0 ? (
              <p className="product-search-empty">No matches — try clearing filters or ask us on WhatsApp.</p>
            ) : (
              visibleItems.map((item) => <ShopCard key={item.id} item={item} contact={contact} onOpen={setQuickViewItem} />)
            )}
          </div>
        </div>

        <RecentlyViewed onOpenProduct={openProductById} />
      </div>

      <ProductQuickView
        product={quickViewItem}
        allItems={flatItems}
        contact={contact}
        onClose={() => setQuickViewItem(null)}
        onOpenProduct={setQuickViewItem}
      />
    </section>
  );
}
