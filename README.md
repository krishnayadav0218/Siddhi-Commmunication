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
- **Products**: Protective gear, Audio, and **Chargers & Power Banks** — each item now shows a **"From ₹X" price**, editable per item in admin
- **Wishlist** — customers can save products (❤️ heart icon, stored on their device) and send the whole list as one WhatsApp message
- **Flash Sale banner** with a live countdown — toggle on/off from admin, hides itself automatically once the offer ends
- **"Find It In 10 Seconds" quiz** — a rule-based recommendation flow (need → budget → matching products/services), the same logic an AI recommender would use, without needing a paid AI API
- **Smart search** — search bar in the header that live-filters across every service, product, and repair feature
- **Shop Assistant chat widget** — answers common questions (hours, location, pricing, repairs) instantly and hands off to WhatsApp for anything else, again with no paid AI API
- **Real photos**: upload a hero shop photo and a gallery of shop/repair photos straight from the admin panel
- **Real embedded Google Map** plus a "Rate us" Google review link
- **LocalBusiness (`ElectronicsStore`) JSON-LD schema** for richer Google search results
- **Live "🟢 Open Now / 🔴 Closed" badge** computed from real IST time vs your shop hours
- **Dismissible announcement bar**, **Testimonials**, **FAQ accordion**, and a **"Request a Callback" form** (opens WhatsApp with the customer's details pre-filled)
- **Repair warranty line**, **live preview** before publishing, **automatic backup** on every save, **login rate-limiting**, self-hosted fonts, Vercel Analytics, `/admin` blocked from search engines, branded 404 page

### Why there's no cart, checkout, Razorpay, or a database

An earlier version of this brief described a full smartphone e-commerce marketplace (cart, checkout, Razorpay payments, MongoDB backend, AI chat via an LLM). That's a genuinely different, larger project from what's built here, and bolting it on would mean:

- A **real database** (orders, stock, SKUs) — this project intentionally has none; content lives in a single JSON file in your GitHub repo
- A **backend that verifies Razorpay payment signatures** server-side (can't be done safely client-only)
- **Inventory/stock tracking**, which a walk-in local shop selling ₹99–₹700 accessories usually doesn't maintain at SKU level
- **Business setup**: a return/refund policy, GST invoicing for online orders, and a registered Razorpay merchant account

Rather than half-build a payment flow that isn't properly secured, this version focuses on what a local shop actually needs: fast walk-in/WhatsApp conversion, not a full online checkout. If you do want real online ordering with payment later, that's a well-scoped follow-up project (Next.js + MongoDB Atlas + Razorpay, still deployable on Vercel) — happy to build it as its own phase whenever you're ready.

### Known limitations (by design)

- **Rate-limiting is cookie-based**, not a server-side store — it stops casual scripted brute force but not a determined attacker clearing cookies between attempts. Fine for a small shop's admin panel; not bank-grade.
- **The callback form doesn't store leads anywhere** — it composes a WhatsApp message instead. Storing form submissions in the GitHub-backed content file would trigger a full site redeploy on *every customer submission*, which isn't a good use of your Vercel build minutes.
- **The chat assistant and finder quiz are rule-based**, not a real AI/LLM. This keeps them free to run forever with no API key or per-message cost. A true LLM-powered assistant is possible later (via the Anthropic or OpenAI API through a new API route) if you want smarter answers and are OK with the ongoing per-message cost.
- **No Hindi/English toggle.** Since almost all visible text is already free-text and admin-editable, you can simply type it in Hindi/Hinglish directly in the admin panel.
- **The wishlist is device-local** (localStorage) — it doesn't sync across a customer's devices, since there's no user-account system.
- Image uploads go through GitHub (same as content saves), so a photo takes ~30–60s after upload to actually appear live.

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
  404.js                 → branded not-found page
  admin/login.js         → admin login form (rate-limited)
  admin/index.js         → admin dashboard incl. image uploads + live preview (protected)
  api/auth/login.js       → password check, rate-limiting, sets session cookie
  api/auth/logout.js      → clears session cookie
  api/content.js          → GET latest content (from GitHub)
  api/save.js              → POST new content → backs up old + commits new to GitHub
  api/upload-image.js      → POST image → commits to public/uploads/ on GitHub
components/               → all landing page sections (Hero, Services, Gallery, FlashSale,
                             FinderQuiz, SearchTrigger, Wishlist, ChatAssistant, etc.)
content/site-content.json → single source of truth for all editable text
lib/github.js              → GitHub Contents API read/write/upload helpers
lib/auth.js                → signed-cookie sessions + login rate-limiting
lib/time.js                 → timezone-safe IST clock & open/closed helpers
lib/useWishlist.js           → localStorage-backed wishlist hook
public/uploads/             → where admin-uploaded photos land
styles/globals.css         → design system (dark/light, glass, animations)
```

## Notes

- Har "Save & Publish" seedha `main` branch par commit karta hai — koi draft/preview mode nahi hai, isliye publish turant live jaata hai (deploy ke baad).
- Agar GitHub env variables set nahi hai, admin panel load to hoga par save karne par error dikhayega ("GitHub is not configured yet...").
- WhatsApp aur call links automatically `contact.phone1` / `contact.phone2` se banate hai — number change karne ke liye sirf Contact section edit karo.
