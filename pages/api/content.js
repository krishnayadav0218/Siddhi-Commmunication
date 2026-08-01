import { isAuthenticated } from '../../lib/auth';
import { getLatestContent } from '../../lib/github';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const content = await getLatestContent();
    return res.status(200).json(content);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to load content' });
  }
}
