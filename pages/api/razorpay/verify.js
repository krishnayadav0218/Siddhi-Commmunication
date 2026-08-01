import crypto from 'crypto';
import { appendOrder } from '../../../lib/github';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ error: 'Payments are not configured.' });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    items,
    customer,
    amount,
  } = req.body || {};

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: 'Missing payment verification fields.' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const sigBuf = Buffer.from(signature, 'utf-8');
  const expBuf = Buffer.from(expectedSignature, 'utf-8');
  const isValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

  if (!isValid) {
    return res.status(400).json({ error: 'Payment signature verification failed.' });
  }

  const orderNumber = `SC-${orderId.slice(-8).toUpperCase()}`;
  const order = {
    orderNumber,
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    amount: (amount || 0) / 100,
    currency: 'INR',
    customer: {
      name: (customer && customer.name) || '',
      phone: (customer && customer.phone) || '',
    },
    items: Array.isArray(items) ? items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })) : [],
    status: 'paid',
    createdAt: new Date().toISOString(),
  };

  try {
    await appendOrder(order);
  } catch (e) {
    // Payment already succeeded and was verified — never fail the customer
    // response just because the order log commit failed. Log for follow-up.
    console.error('Failed to persist order record:', e.message);
  }

  return res.status(200).json({ ok: true, orderNumber });
}
