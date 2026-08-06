import { isAuthenticated } from '../../lib/auth';
import { getOrders, saveAllOrders } from '../../lib/github';

const STATUS_FLOW = ['paid', 'processing', 'ready', 'completed'];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { orderNumber, phone } = req.body || {};
    const num = String(orderNumber || '').trim().toUpperCase();
    const last4 = String(phone || '').trim().slice(-4);

    if (!num || last4.length !== 4) {
      return res.status(400).json({ error: 'Enter your order number and the last 4 digits of your phone number.' });
    }

    const orders = await getOrders();
    const order = orders.find(
      (o) => (o.orderNumber || '').toUpperCase() === num && String(o.customer?.phone || '').slice(-4) === last4
    );

    if (!order) {
      return res.status(404).json({ error: "We couldn't find an order matching those details. Double-check and try again." });
    }

    return res.status(200).json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status || 'paid',
        amount: order.amount,
        items: order.items,
        createdAt: order.createdAt,
        statusHistory: order.statusHistory || [],
      },
      statusFlow: STATUS_FLOW,
    });
  }

  if (req.method === 'PATCH') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { orderNumber, status } = req.body || {};
    if (!orderNumber || !STATUS_FLOW.concat('cancelled').includes(status)) {
      return res.status(400).json({ error: 'Invalid status update.' });
    }
    const orders = await getOrders();
    const idx = orders.findIndex((o) => o.orderNumber === orderNumber);
    if (idx === -1) return res.status(404).json({ error: 'Order not found.' });

    const history = orders[idx].statusHistory || [];
    orders[idx] = {
      ...orders[idx],
      status,
      statusHistory: [...history, { status, at: new Date().toISOString() }],
    };

    try {
      await saveAllOrders(orders, `Order ${orderNumber} → ${status}`);
      return res.status(200).json({ ok: true, order: orders[idx] });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Could not update order.' });
    }
  }

  res.setHeader('Allow', ['POST', 'PATCH']);
  return res.status(405).json({ error: 'Method not allowed' });
}
