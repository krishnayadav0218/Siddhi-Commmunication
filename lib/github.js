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
  'hero',
  'stats',
  'brands',
  'services',
  'productCategories',
  'repairFeatures',
  'repairStatus',
  'contact',
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

async function getFileSha(cfg) {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}?ref=${cfg.branch}`;
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
    throw new Error(err.message || 'Failed to read current file from GitHub');
  }
  const data = await res.json();
  return data.sha;
}

// Commits new content straight to the configured branch. Vercel's GitHub
// integration then automatically triggers a redeploy from that push.
export async function commitContent(newContent, message) {
  const cfg = getConfig();
  if (!isConfigured(cfg)) {
    throw new Error(
      'GitHub is not configured yet. Set GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO in your Vercel project environment variables.'
    );
  }

  const sha = await getFileSha(cfg);
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}`;
  const body = {
    message: message || 'Update site content via admin panel',
    content: Buffer.from(JSON.stringify(newContent, null, 2), 'utf-8').toString('base64'),
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
    throw new Error(err.message || 'Failed to commit content to GitHub');
  }

  return res.json();
}
