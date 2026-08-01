import { isAuthenticated } from '../../lib/auth';
import { commitUploadedImage } from '../../lib/github';

export const config = {
  api: {
    bodyParser: { sizeLimit: '6mb' },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { filename, base64, folder } = req.body || {};
  if (!filename || !base64) {
    return res.status(400).json({ error: 'Missing filename or image data' });
  }

  const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
  const safeFolder = String(folder || 'general').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  const uniqueName = `${Date.now()}-${safeName}`;

  try {
    const url = await commitUploadedImage(safeFolder, uniqueName, base64);
    return res.status(200).json({ ok: true, url });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Upload failed' });
  }
}
