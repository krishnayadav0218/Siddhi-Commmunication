import { useState } from 'react';
import { useCart } from '../lib/cart';
import CheckoutModal from './CheckoutModal';

function formatINR(n) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function FloatingCartButton() {
  const { count, openDrawer } = useCart();
  if (count === 0) return null;
  return (
    <button className="fab-cart" onClick={openDrawer} aria-label="Open cart" type="button">
      🛒
      <span className="fab-cart-badge">{count}</span>
    </button>
  );
}

export default function CartDrawer({ content }) {
  const { items, count, subtotal, updateQty, removeItem, drawerOpen, closeDrawer, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { contact } = content;
  const cartCfg = content.cart || {};

  function buildWhatsappMessage() {
    const lines = items.map((i) => `• ${i.name} × ${i.qty} — ${formatINR(i.price * i.qty)}`);
    const text = `${cartCfg.whatsappOrderIntro || "Hi, I'd like to order:"}\n\n${lines.join('\n')}\n\nTotal (approx): ${formatINR(subtotal)}`;
    return `https://wa.me/91${contact.phone1}?text=${encodeURIComponent(text)}`;
  }

  return (
    <>
      <div className={`cart-overlay${drawerOpen ? ' open' : ''}`} onClick={closeDrawer} />
      <aside className={`cart-drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="cart-drawer-head">
          <h3>Your Cart {count > 0 ? `(${count})` : ''}</h3>
          <button className="cart-close" onClick={closeDrawer} aria-label="Close cart" type="button">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <p className="cart-empty-sub">Add accessories from the shop to see them here.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <span className="cart-item-ic">{item.icon}</span>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <div className="cart-item-price">{formatINR(item.price)} each</div>
                  </div>
                  <div className="cart-qty">
                    <button type="button" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease quantity">
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <button className="cart-remove" onClick={() => removeItem(item.id)} aria-label="Remove item" type="button">
                    🗑
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-subtotal-row">
                <span>Subtotal</span>
                <strong>{formatINR(subtotal)}</strong>
              </div>
              <p className="cart-note">{cartCfg.codNote}</p>

              <a className="btn btn-primary btn-block" href={buildWhatsappMessage()} target="_blank" rel="noreferrer">
                💬 Send Order on WhatsApp
              </a>
              <button className="btn btn-ghost btn-block" type="button" onClick={() => setCheckoutOpen(true)}>
                💳 Pay Online Now
              </button>
              <button className="cart-clear" type="button" onClick={clearCart}>
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>

      {checkoutOpen ? (
        <CheckoutModal
          content={content}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {
            clearCart();
            setCheckoutOpen(false);
            closeDrawer();
          }}
        />
      ) : null}
    </>
  );
}
