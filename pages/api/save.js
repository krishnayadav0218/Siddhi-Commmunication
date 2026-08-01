import { isAuthenticated } from '../../lib/auth';
import { commitContent } from '../../lib/github';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const newContent = req.body;
  if (!newContent || typeof newContent !== 'object' || Array.isArray(newContent)) {
    return res.status(400).json({ error: 'Invalid content payload' });
  }

  try {
    await commitContent(newContent, 'Update site content via admin panel');
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to save content' });
  }
}
