import { useMemo, useState } from 'react';
import Reveal from './Reveal';
import { useCart } from '../lib/cart';
import { useWishlist } from '../lib/useWishlist';
import { getProductId, parsePriceValue } from '../lib/productUtils';

function ShopCard({ item, contact }) {
  const { addItem, items } = useCart();
  const { toggle, isSaved } = useWishlist();
  const inCart = items.find((p) => p.id === item.id);
  const saved = isSaved(item.name);
  const outOfStock = item.inStock === false;

  return (
    <div className={`shop-card${outOfStock ? ' out-of-stock' : ''}`}>
      <div className="shop-card-media">
        <span className="shop-card-ic">{item.icon}</span>
        <button
          type="button"
          className={`wishlist-heart${saved ? ' saved' : ''}`}
          onClick={() => toggle({ name: item.name, icon: item.icon, priceFrom: item.priceFrom })}
          aria-label={saved ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
        >
          {saved ? '❤️' : '🤍'}
        </button>
        {outOfStock ? (
          <span className="stock-badge stock-out">Out of Stock</span>
        ) : (
          <span className="stock-badge stock-in">In Stock</span>
        )}
      </div>
      <div className="shop-card-body">
        <h4>{item.name}</h4>
        {item.priceFrom ? <div className="p-price">From {item.priceFrom}</div> : null}
        <div className="shop-card-actions">
          <button
            type="button"
            className="btn-add-cart"
            disabled={outOfStock}
            onClick={() => addItem(item, 1)}
          >
            {outOfStock ? 'Unavailable' : inCart ? `🛒 In Cart (${inCart.qty})` : '🛒 Add to Cart'}
          </button>
          <a
            className="wa-mini"
            href={`https://wa.me/91${contact.phone1}?text=I%27m%20interested%20in%20${encodeURIComponent(item.name)}`}
            target="_blank"
            rel="noreferrer"
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
              placeholder="Search accessories…"
              aria-label="Search accessories"
            />
          </div>
          <select className="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock">Stock: In-stock first</option>
          </select>
          <label className="shop-stock-toggle">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            <span>In stock only</span>
          </label>
        </div>

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <button
              type="button"
              className={`shop-cat-btn${active === 'all' ? ' active' : ''}`}
              onClick={() => setActive('all')}
            >
              All Accessories
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
              visibleItems.map((item) => <ShopCard key={item.id} item={item} contact={contact} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
