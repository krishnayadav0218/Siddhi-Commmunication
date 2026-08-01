import { isAuthenticated } from '../../lib/auth';
import { getOrders } from '../../lib/github';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const orders = await getOrders();
    return res.status(200).json({ orders: orders.slice().reverse() });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to load orders' });
  }
}
