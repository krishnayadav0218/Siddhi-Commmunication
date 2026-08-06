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
- **Real photos**: upload a hero shop photo and a gallery of shop/repair photos straight from the admin panel — no manual GitHub upload needed
- **Real embedded Google Map** (not just a decorative pin) plus a "Rate us" Google review link
- **LocalBusiness (`ElectronicsStore`) JSON-LD schema** — helps Google show your name, address, hours and rating directly in search results
- **Live "🟢 Open Now / 🔴 Closed" badge** — computed from real IST time vs your shop hours, shown in the hero and on the repair status widget
- **Dismissible announcement bar** for offers/new stock
- **Testimonials**, **FAQ accordion**, and a **"Request a Callback" form** (opens WhatsApp with the customer's details pre-filled — no database needed)
- **Repair warranty line** (e.g. "7-Day Service Warranty")
- **Live preview** in the admin panel — see your unsaved edits rendered as the real site before publishing
- **Automatic backup** — every publish first backs up the previous content to `content/site-content.backup.json` in your repo
- **Login rate-limiting** — 5 wrong passwords locks the login form for 10 minutes
- Self-hosted fonts (via `next/font`) and Vercel Web Analytics built in
- `/admin` is blocked from search engines (`robots.txt` + `noindex` meta)
- Branded 404 page

### Known limitations (by design)

- **Rate-limiting is cookie-based**, not a server-side store — it stops casual scripted brute force but not a determined attacker clearing cookies between attempts. Fine for a small shop's admin panel; not bank-grade.
- **The callback form doesn't store leads anywhere** — it composes a WhatsApp message instead. This was a deliberate choice: storing form submissions in the GitHub-backed content file would trigger a full site redeploy on *every customer submission*, which isn't a good use of your Vercel build minutes.
- **No Hindi/English toggle.** Since almost all visible text is already free-text and admin-editable, you can simply type it in Hindi/Hinglish directly in the admin panel — a full bilingual toggle would require maintaining two copies of every field, which adds a lot of complexity for little real benefit here.
- Image uploads go through GitHub (same as content saves), so a photo takes ~30–60s after upload to actually appear live, same as any other content change.

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
  admin/orders.js         → view paid online orders (protected)
  api/auth/login.js       → password check, rate-limiting, sets session cookie
  api/auth/logout.js      → clears session cookie
  api/content.js          → GET latest content (from GitHub)
  api/save.js              → POST new content → backs up old + commits new to GitHub
  api/upload-image.js      → POST image → commits to public/uploads/ on GitHub
  api/orders.js            → GET paid orders (protected)
  api/razorpay/create-order.js → creates a Razorpay order (server-priced from content)
  api/razorpay/verify.js       → verifies payment signature + persists the order
components/               → all landing page sections (Hero, Services, Gallery, etc.)
components/Recommender.js → "Find What You Need" AI-style suggestion quiz
components/ChatAssistant.js → rule-based FAQ chat widget (falls back to WhatsApp)
components/EMIInfo.js      → EMI / easy-payment info banner
components/CartDrawer.js   → slide-in cart + WhatsApp order + "Pay Online"
components/CheckoutModal.js → Razorpay checkout flow
content/site-content.json → single source of truth for all editable text
content/orders.json        → paid order log (git-committed, same pattern as content)
lib/github.js              → GitHub Contents API read/write/upload/order helpers
lib/auth.js                → signed-cookie sessions + login rate-limiting
lib/time.js                 → timezone-safe IST clock & open/closed helpers
lib/cart.js                 → cart state (React context + localStorage)
public/uploads/             → where admin-uploaded photos land
styles/globals.css         → design system (dark/light, glass, animations)
```

## Brand logo (latest update)

Added a real logo — a phone-with-signal-waves mark (reads as both "mobile shop" and "communication services") instead of the old generic shield icon.

- `components/Logo.js` — the icon glyph, reused everywhere so there's only one source of truth: header, footer, hero centerpiece, browser tab favicon, admin login, 404 page, and the admin dashboard header.
- `lib/favicon.js` — the same mark encoded as a favicon data URI, wired into every page's `<Head>` (site + all `/admin` pages), so every browser tab shows it consistently.
- `public/logo.svg` — a standalone horizontal lockup (icon + "Siddhi Communication" wordmark) on a transparent background, sized for social profile photos, letterheads, or printouts. Note: its wordmark text is dark, so it's designed for **light backgrounds** — if you need a white-text version for dark backgrounds, ask and I'll generate one.
- Colors match the existing teal (`#159ba0`) → marigold-gold (`#f2a324`) brand gradient, so it's consistent with the rest of the site.

## Merged feature set (previous update)

This update reconciled two parallel branches of the project into one working codebase, fixed a build-breaking bug, and added several requested features:

- **Fixed:** `lib/github.js` was missing `getOrders`/`appendOrder`, which broke `/api/orders` and payment verification. Restored.
- **Wishlist** (`components/Wishlist.js`, `lib/useWishlist.js`) — heart icon on every shop card, device-local (localStorage), panel opens from the header.
- **Flash Sale banner** (`components/FlashSale.js`) — countdown banner, toggle + edit from Admin → "Flash Sale Banner" (off by default).
- **Finder Quiz** (`components/FinderQuiz.js`) — replaces the earlier "Recommender"; 2-step quiz that suggests accessories (with Add-to-Cart), repairs, or services.
- **Site search** (`components/SearchTrigger.js`) — header search icon, searches accessories/services/FAQs.
- **Product stock management** — every accessory now has an `inStock` flag. Toggle "In stock / Out of stock" per item in Admin → "Mobile Accessories". Out-of-stock items show a badge, disable Add-to-Cart, and are rejected server-side even if someone tries to check out with a stale cart.
- **Product IDs are derived, not stored** (`lib/productUtils.js`) — cart/checkout always compute an item's id from its category + name, so admin can freely add/remove accessories without needing to fill in any hidden field.
- **Redesigned Shop section** — sidebar category filter, search, sort (price / stock), and a dedicated card layout distinct from the rest of the site (`.shop-*` classes in `globals.css`).
- **Public customer reviews** — anyone can submit a review from the Testimonials section (name + star rating + text). Submissions start as "pending" and are **not shown publicly** until approved from `/admin/reviews`, so the public form can't be used to post live spam. Approved reviews are blended in with the curated `testimonials` from content.
- **Hero visual — full redesign** — replaced the old phone-mockup illustration (which had a light-mode contrast bug: fixed white text over a background that didn't always stay dark). The new "showcase card" always pairs background and text from the same theme variable, so it can't lose contrast in either theme, in addition to just looking different.

## Six new features (latest update)

- **Order tracking** — `/track-order` page, customers enter order number + last 4 digits of their phone (so orders can't be enumerated by strangers). Status flow: `paid → processing → ready → completed` (or `cancelled`). Update status from `/admin/orders`, which also has a one-click **"Notify on WhatsApp"** button that pre-fills a status message to the customer — no paid SMS gateway needed, fits the site's existing WhatsApp-first workflow.
- **Recently viewed + "You might also like"** — clicking any shop card opens a Quick View (`components/ProductQuickView.js`), which records the view (`lib/useRecentlyViewed.js`, localStorage) and shows related items from the same category. A "Recently Viewed" strip appears below the shop grid once you've viewed something.
- **Hindi/English toggle** — `lib/i18n.js` + `lib/LanguageContext.js`, toggle in the header (persists across visits). Covers UI chrome — buttons, labels, cart, EMI calculator, order tracking. Admin-authored content (hero text, service descriptions, testimonials) is written by the shop owner in whichever language they choose and isn't auto-translated, since that would require writing everything twice.
- **Installable app (PWA)** — real icons generated from the logo (`public/icons/`), `manifest.json`, a minimal offline-capable service worker (`public/sw.js`), and an "Install App" button in the header that only appears when the browser confirms it's installable.
- **Google Reviews** — `components/GoogleReviews.js`. Works immediately with zero setup as a "Rate Us on Google" button (uses the `googleReviewUrl` field already in Admin → Contact & Location). If you add `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` to your env, it also pulls in live review snippets automatically — both are optional and documented in `.env.example`.

## Theme refresh & merged feature set (previous updates)

The color palette was shifted away from the generic tech blue/gold combo to something more tied to the shop's own city — deep indigo-night background with a **Ganga-teal** primary accent and a **marigold-gold** secondary accent (with a small sindoor-red touch in the ambient background glow). This was a palette-only change: fonts, layout, spacing, and section structure are untouched, so nothing else needs re-testing. All colors are still driven by CSS variables (`--blue`, `--gold`, etc. in `styles/globals.css`) — change those values in one place if you want to try a different palette later.

## New features (this update)

- **Search & filter** — a search box above the accessories tabs filters across all categories instantly.
- **"Find What You Need" recommender** — a 2-step quiz (need → budget) that suggests accessories, repair services, or booking services, matched from the same `productCategories`/`services`/`repairFeatures` you already edit in `/admin`.
- **Chat assistant** — a floating chat bubble that answers from your existing FAQ list (keyword matching, no external AI API/cost) and hands off to WhatsApp for anything it can't answer.
- **EMI / payment options banner** — editable via the `emi` block in `content/site-content.json`.
- **Cart** — "Add to Cart" on every accessory, a slide-in drawer, and a combined WhatsApp order message (no payment required).
- **Real online checkout (Razorpay)** — "Pay Online Now" in the cart opens Razorpay Checkout. Orders are priced server-side (never trusts the browser), verified by signature, and logged to `content/orders.json` via the same GitHub-commit pattern used for site content. View paid orders at `/admin/orders`.

To enable online payments, add to your env (Vercel + `.env.local`):
```
RAZORPAY_KEY_ID=rzp_live_or_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
```
Without these set, "Pay Online Now" shows a friendly message and customers can still order via WhatsApp — nothing breaks.

## Notes

- Har "Save & Publish" seedha `main` branch par commit karta hai — koi draft/preview mode nahi hai, isliye publish turant live jaata hai (deploy ke baad).
- Agar GitHub env variables set nahi hai, admin panel load to hoga par save karne par error dikhayega ("GitHub is not configured yet...").
- WhatsApp aur call links automatically `contact.phone1` / `contact.phone2` se banate hai — number change karne ke liye sirf Contact section edit karo.
- Cart data live only in the visitor's browser (localStorage) — nothing is sent anywhere until they hit "Send Order on WhatsApp" or complete online payment.
