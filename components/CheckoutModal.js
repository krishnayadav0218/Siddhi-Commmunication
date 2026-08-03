import { useState } from 'react';
import { useCart } from '../lib/cart';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutModal({ content, onClose, onSuccess }) {
  const { items, subtotal } = useCart();
  const { contact, brand } = content;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  async function handlePay(e) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !/^\d{10}$/.test(phone.trim())) {
      setError('Please enter your name and a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer: { name, phone } }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Could not start payment. Please try again.');

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Could not load payment gateway. Check your connection and try again.');

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: brand,
        description: `Order · ${items.length} item(s)`,
        order_id: orderData.orderId,
        prefill: { name, contact: phone },
        theme: { color: '#8b5cf6' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items,
                customer: { name, phone },
                amount: orderData.amount,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.ok) throw new Error(verifyData.error || 'Payment verification failed.');
            setSuccess(verifyData.orderNumber || response.razorpay_payment_id);
          } catch (err) {
            setError(err.message || 'Payment verification failed. If money was deducted, contact us on WhatsApp with your payment ID.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.on('payment.failed', () => {
        setError('Payment failed or was cancelled. You can try again or send your order on WhatsApp instead.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cart-close" onClick={onClose} aria-label="Close" type="button">
          ✕
        </button>

        {success ? (
          <div className="checkout-success">
            <div className="checkout-success-ic">✅</div>
            <h3>Payment Successful!</h3>
            <p>Order confirmed. Reference: <strong>{success}</strong></p>
            <p className="cart-empty-sub">
              We'll have it ready at the counter. You can also message us on WhatsApp with this reference for pickup timing.
            </p>
            <a
              className="btn btn-primary btn-block"
              href={`https://wa.me/91${contact.phone1}?text=${encodeURIComponent(
                `Hi, I just paid online for order ${success}. Please confirm pickup timing.`
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              💬 Confirm on WhatsApp
            </a>
            <button className="btn btn-ghost btn-block" type="button" onClick={onSuccess}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handlePay}>
            <h3>Checkout</h3>
            <p className="cart-empty-sub">{items.length} item(s) · Total ₹{subtotal.toLocaleString('en-IN')}</p>

            <label className="form-field">
              <span>Full Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </label>
            <label className="form-field">
              <span>Phone Number</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                required
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Processing…' : `Pay ₹${subtotal.toLocaleString('en-IN')} Now`}
            </button>
            <p className="checkout-secure-note">🔒 Secured by Razorpay. Pickup only from our Khojwa Bazar counter.</p>
          </form>
        )}
      </div>
    </div>
  );
}
