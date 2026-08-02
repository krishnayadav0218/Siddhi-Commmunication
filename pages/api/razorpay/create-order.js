import content from '../../../content/site-content.json';
import { flattenProducts } from '../../../lib/productUtils';

// Builds a lookup of valid product id -> current price/stock directly from
// the published content, so the amount charged is always server-derived and
// never trusts whatever price the client sent.
function buildPriceMap() {
  const map = new Map();
  flattenProducts(content.productCategories).forEach((item) => {
    map.set(item.id, item);
  });
  return map;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return res.status(500).json({
      error: 'Online payments are not configured yet. Please use "Send Order on WhatsApp" instead.',
    });
  }

  const { items, customer } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }
  if (!customer || !customer.name || !/^\d{10}$/.test(String(customer.phone || ''))) {
    return res.status(400).json({ error: 'Valid name and 10-digit phone number are required.' });
  }

  const priceMap = buildPriceMap();
  let amountRupees = 0;
  for (const item of items) {
    const product = priceMap.get(item.id);
    if (product === undefined) {
      return res.status(400).json({ error: `Item "${item.name}" is no longer available.` });
    }
    if (!product.inStock) {
      return res.status(400).json({ error: `"${product.name}" just went out of stock. Please remove it from your cart.` });
    }
    const qty = Math.max(1, Math.min(50, parseInt(item.qty, 10) || 1));
    amountRupees += product.price * qty;
  }
  if (amountRupees <= 0) {
    return res.status(400).json({ error: 'Order amount must be greater than zero.' });
  }

  const amountPaise = Math.round(amountRupees * 100);
  const receipt = `siddhi_${Date.now()}`;

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const rzRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: { customerName: customer.name, customerPhone: customer.phone },
      }),
    });
    const rzData = await rzRes.json();
    if (!rzRes.ok) {
      throw new Error(rzData.error?.description || 'Failed to create payment order.');
    }

    return res.status(200).json({
      orderId: rzData.id,
      amount: amountPaise,
      currency: 'INR',
      keyId,
      receipt,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to start payment.' });
  }
}
