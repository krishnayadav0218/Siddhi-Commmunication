import localContent from '../content/site-content.json';

function getConfig() {
  return {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main',
    path: process.env.GITHUB_CONTENT_PATH || 'content/site-content.json',
    token: process.env.GITHUB_TOKEN,
  };
}

function isConfigured(cfg) {
  return !!(cfg.owner && cfg.repo && cfg.token);
}

const TOP_LEVEL_KEYS = [
  'brand',
  'announcement',
  'flashSale',
  'hero',
  'stats',
  'brands',
  'services',
  'productCategories',
  'repairFeatures',
  'repairStatus',
  'contact',
  'gallery',
  'testimonials',
  'faqs',
  'footer',
];

// Fills in any top-level keys missing from remote content with the
// bundled defaults, so older commits (made before a new field was added)
// never crash the admin panel on a missing array's .map().
function mergeWithDefaults(remote) {
  if (!remote || typeof remote !== 'object') return localContent;
  const merged = { ...localContent, ...remote };
  TOP_LEVEL_KEYS.forEach((key) => {
    if (remote[key] === undefined || remote[key] === null) {
      merged[key] = localContent[key];
    }
  });
  return merged;
}

// Fetch the latest published content. Falls back to the file bundled at
// build time if GitHub isn't configured yet or the request fails.
export async function getLatestContent() {
  const cfg = getConfig();
  if (!isConfigured(cfg)) {
    return localContent;
  }
  try {
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}?ref=${cfg.branch}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: 'application/vnd.github.raw+json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return localContent;
    const text = await res.text();
    return mergeWithDefaults(JSON.parse(text));
  } catch (e) {
    return localContent;
  }
}

// --- Generic file helpers (used for content.json, backups, and uploads) ---

async function getFileShaForPath(cfg, path) {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
    },
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to read ${path} from GitHub`);
  }
  const data = await res.json();
  return data.sha;
}

// Commits a base64-encoded file (text or binary) to the given path.
export async function commitFile(path, base64Content, message) {
  const cfg = getConfig();
  if (!isConfigured(cfg)) {
    throw new Error(
      'GitHub is not configured yet. Set GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO in your Vercel project environment variables.'
    );
  }

  const sha = await getFileShaForPath(cfg, path);
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
  const body = {
    message: message || `Update ${path}`,
    content: base64Content,
    branch: cfg.branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to commit ${path} to GitHub`);
  }

  return res.json();
}

// Commits new content straight to the configured branch. Vercel's GitHub
// integration then automatically triggers a redeploy from that push.
// Before overwriting, best-effort backs up the current content so the
// previous version is always recoverable from git history / the backup file.
export async function commitContent(newContent, message) {
  const cfg = getConfig();
  if (!isConfigured(cfg)) {
    throw new Error(
      'GitHub is not configured yet. Set GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO in your Vercel project environment variables.'
    );
  }

  try {
    const current = await getLatestContent();
    if (current) {
      const backupBase64 = Buffer.from(JSON.stringify(current, null, 2), 'utf-8').toString('base64');
      await commitFile('content/site-content.backup.json', backupBase64, 'Backup previous content before publish');
    }
  } catch (e) {
    // Backup is best-effort only — never block the actual publish because of it.
  }

  const base64 = Buffer.from(JSON.stringify(newContent, null, 2), 'utf-8').toString('base64');
  return commitFile(cfg.path, base64, message || 'Update site content via admin panel');
}

// Commits an uploaded image (already base64-encoded by the browser) under
// public/uploads/, so it's served as a static file after the next deploy.
export async function commitUploadedImage(safeFolder, uniqueFilename, base64Content) {
  const path = `public/uploads/${safeFolder}/${uniqueFilename}`;
  await commitFile(path, base64Content, `Upload image via admin panel: ${uniqueFilename}`);
  return `/uploads/${safeFolder}/${uniqueFilename}`;
}
