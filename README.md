# Siddhi Communication — Website + Admin Panel

Next.js website with a password-protected `/admin` panel. Jab bhi admin panel se content save karte ho, woh seedha aapke GitHub repo me commit ho jata hai — aur Vercel ka GitHub integration automatically naya deployment bana deta hai (~30–60 seconds me live).

## 1. GitHub par upload karo

1. GitHub par ek naya **private** repository banao (e.g. `siddhi-communication`).
2. Is folder ka pura content us repo me push karo:
   ```bash
   cd siddhi-site
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/siddhi-communication.git
   git push -u origin main
   ```

## 2. Vercel par import karo

1. [vercel.com](https://vercel.com) par login karo (GitHub account se).
2. **Add New → Project** → apna GitHub repo select karo → **Import**.
3. Framework auto-detect ho jayega (Next.js). Deploy na dabao abhi — pehle env variables set karo (Step 3), phir Deploy.

## 3. Environment Variables (Vercel Project Settings → Environment Variables)

| Key | Value | Notes |
|---|---|---|
| `ADMIN_PASSWORD` | apna secret password | `/admin` login ke liye |
| `SESSION_SECRET` | koi bhi lambi random string | login session sign karne ke liye |
| `GITHUB_TOKEN` | GitHub Personal Access Token | neeche steps hai |
| `GITHUB_OWNER` | aapka GitHub username/org | e.g. `akashjaiswal` |
| `GITHUB_REPO` | repo ka naam | e.g. `siddhi-communication` |
| `GITHUB_BRANCH` | `main` | jis branch se Vercel deploy karta hai |
| `GITHUB_CONTENT_PATH` | `content/site-content.json` | change mat karo jab tak file move na karo |

### GitHub Token kaise banaye
1. GitHub → Settings → Developer settings → **Personal access tokens → Fine-grained tokens**.
2. **Generate new token** → sirf isi repository ko select karo (`siddhi-communication`).
3. Permissions me **Contents → Read and write** on karo.
4. Token generate karke copy karo, aur `GITHUB_TOKEN` env variable me paste karo.

Env variables add karne ke baad, Vercel project ko **Redeploy** karo taaki variables apply ho jayein.

## 4. Admin panel use karna

1. Apni site ke URL ke aage `/admin` lagao — e.g. `https://siddhi-communication.vercel.app/admin`
2. Pehli baar `/admin/login` par redirect hoga — apna `ADMIN_PASSWORD` daalo.
3. Content edit karo (Hero text, contact numbers, services, products, repair features, etc.)
4. Neeche **🚀 Save & Publish** dabao.
5. Yeh content GitHub par commit ho jayega, aur Vercel apne aap naya build shuru kar dega. ~30–60 second baad live site update ho jayegi.

## What's included (mobile shop features)

- **10 services**: AEPS/Aadhaar ATM, Bus/Railway/Hotel/Car/Flight booking, Govt & Cyber services, **Recharge & Bill Payment**, **New SIM & Number Port**, **Buy/Sell Old Mobile**
- **Products**: Protective gear, Audio, and **Chargers & Power Banks** (cables, adapters, power banks, car charger)
- **Live "🟢 Open Now / 🔴 Closed" badge** — computed from real IST time vs your shop hours, shown in the hero and on the repair status widget (never falsely shows "Open" before the real check runs)
- **Google rating badge** with a "Rate us" link
- **Dismissible announcement bar** for offers/new stock (e.g. "New TWS earbuds in stock")
- **Testimonials** and **FAQ accordion**
- **Repair warranty line** (e.g. "7-Day Service Warranty")
- `/admin` is blocked from search engines (`robots.txt` + `noindex` meta) so it never shows up in Google
- Branded 404 page

## Local development (optional)

```bash
npm install
npm run dev
```

Local par `/admin` login to hoga, lekin **Save & Publish** tabhi kaam karega jab `.env.local` me saare GitHub env variables set ho (same jaise Vercel me):

```
ADMIN_PASSWORD=...
SESSION_SECRET=...
GITHUB_TOKEN=...
GITHUB_OWNER=...
GITHUB_REPO=...
GITHUB_BRANCH=main
GITHUB_CONTENT_PATH=content/site-content.json
```

## Project structure

```
pages/
  index.js              → public landing page (reads content/site-content.json)
  admin/login.js         → admin login form
  admin/index.js         → admin dashboard (protected)
  api/auth/login.js       → password check, sets session cookie
  api/auth/logout.js      → clears session cookie
  api/content.js          → GET latest content (from GitHub)
  api/save.js              → POST new content → commits to GitHub
components/               → all landing page sections (Hero, Services, Products, etc.)
content/site-content.json → single source of truth for all editable text
lib/github.js              → GitHub Contents API read/write helpers
lib/auth.js                → signed-cookie session helpers
styles/globals.css         → design system (dark/light, glass, animations)
```

## Notes

- Har "Save & Publish" seedha `main` branch par commit karta hai — koi draft/preview mode nahi hai, isliye publish turant live jaata hai (deploy ke baad).
- Agar GitHub env variables set nahi hai, admin panel load to hoga par save karne par error dikhayega ("GitHub is not configured yet...").
- WhatsApp aur call links automatically `contact.phone1` / `contact.phone2` se banate hai — number change karne ke liye sirf Contact section edit karo.
