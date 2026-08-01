import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import localContent from '../../content/site-content.json';
import { isAuthenticated } from '../../lib/auth';
import AnnouncementBar from '../../components/AnnouncementBar';
import Header from '../../components/Header';
import Hero from '../../components/Hero';
import Marquee from '../../components/Marquee';
import Services from '../../components/Services';
import Products from '../../components/Products';
import Repair from '../../components/Repair';
import Gallery from '../../components/Gallery';
import Testimonials from '../../components/Testimonials';
import Trust from '../../components/Trust';
import FAQ from '../../components/FAQ';
import CallbackForm from '../../components/CallbackForm';
import Footer from '../../components/Footer';

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { props: {} };
}

function cloneContent(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(String(result).split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <h2 style={s.sectionTitle}>{title}</h2>
      <div style={s.sectionBody}>{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, textarea, small }) {
  return (
    <label style={{ ...s.field, ...(small ? { maxWidth: 130 } : {}) }}>
      <span style={s.label}>{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} style={s.textarea} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={s.input} />
      )}
    </label>
  );
}

function ListField({ label, items, onChange }) {
  function updateItem(i, val) {
    const next = [...items];
    next[i] = val;
    onChange(next);
  }
  function add() {
    onChange([...items, '']);
  }
  function remove(i) {
    const next = [...items];
    next.splice(i, 1);
    onChange(next);
  }
  return (
    <div style={s.field}>
      <span style={s.label}>{label}</span>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={it} onChange={(e) => updateItem(i, e.target.value)} style={{ ...s.input, flex: 1 }} />
          <button type="button" onClick={() => remove(i)} style={s.btnRemove}>✕</button>
        </div>
      ))}
      <button type="button" onClick={add} style={s.btnAdd}>+ Add</button>
    </div>
  );
}

function ImageUploadField({ label, value, onChange, folder }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 4.5 * 1024 * 1024) {
      setError('Image too large — please use a file under 4MB.');
      e.target.value = '';
      return;
    }
    setUploading(true);
    setError('');
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, base64, folder }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        onChange(data.url);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed — check your connection and try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div style={s.field}>
      <span style={s.label}>{label}</span>
      {value ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" style={s.thumb} />
          <button type="button" onClick={() => onChange('')} style={s.btnRemove}>Remove</button>
        </div>
      ) : null}
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={s.input} />
      {uploading ? <p style={s.helperText}>Uploading…</p> : null}
      {error ? <p style={{ ...s.helperText, color: '#ff5c72' }}>{error}</p> : null}
      <p style={s.helperText}>Uploads commit straight to GitHub and go live after the next auto-deploy (~30–60s). Max 4MB.</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [content, setContent] = useState(localContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/content')
      .then((r) => {
        if (r.status === 401) {
          router.push('/admin/login');
          return null;
        }
        return r.ok ? r.json() : Promise.reject();
      })
      .then((data) => {
        if (data) setContent({ ...localContent, ...data });
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(path, value) {
    setContent((prev) => {
      const next = cloneContent(prev);
      let obj = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value;
      return next;
    });
  }

  function addItem(path, template) {
    setContent((prev) => {
      const next = cloneContent(prev);
      let arr = next;
      for (let i = 0; i < path.length; i++) arr = arr[path[i]];
      arr.push(template);
      return next;
    });
  }

  function removeItem(path, index) {
    setContent((prev) => {
      const next = cloneContent(prev);
      let arr = next;
      for (let i = 0; i < path.length; i++) arr = arr[path[i]];
      arr.splice(index, 1);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        setMessage({ type: 'ok', text: '✅ Saved! Pushed to GitHub — Vercel will redeploy in ~30–60 seconds.' });
      } else if (res.status === 401) {
        setMessage({ type: 'err', text: '❌ Your session expired. Redirecting to login…' });
        setTimeout(() => router.push('/admin/login'), 1500);
      } else {
        const d = await res.json().catch(() => ({}));
        setMessage({ type: 'err', text: '❌ ' + (d.error || 'Save failed') });
      }
    } catch (e) {
      setMessage({ type: 'err', text: '❌ Network error while saving.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 7000);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  if (loading) {
    return <div style={s.loadingWrap}>Loading content…</div>;
  }

  return (
    <>
      <Head>
        <title>Admin — Siddhi Communication</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={s.page}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.h1}>Siddhi Communication — Admin</h1>
            <p style={s.hint}>
              Edit content below, then hit <strong>Save &amp; Publish</strong>. Changes commit straight to GitHub and
              Vercel redeploys automatically.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setPreviewOpen(true)} style={s.btnGhost} type="button">👁 Preview</button>
            <a href="/" target="_blank" rel="noreferrer" style={s.btnGhost}>View live site ↗</a>
            <button onClick={handleLogout} style={s.btnGhost} type="button">Logout</button>
          </div>
        </div>

        {previewOpen ? (
          <div style={s.previewOverlay}>
            <div style={s.previewBar}>
              <span>👁 Live Preview — showing your unsaved changes</span>
              <button type="button" onClick={() => setPreviewOpen(false)} style={s.previewClose}>✕ Close Preview</button>
            </div>
            <div>
              <AnnouncementBar content={content} />
              <Header content={content} />
              <Hero content={content} />
              <Marquee content={content} />
              <Services content={content} />
              <Products content={content} />
              <Repair content={content} />
              <Gallery content={content} />
              <Testimonials content={content} />
              <Trust content={content} />
              <FAQ content={content} />
              <CallbackForm content={content} />
              <Footer content={content} />
            </div>
          </div>
        ) : null}

        {message ? (
          <div style={{ ...s.message, ...(message.type === 'ok' ? s.messageOk : s.messageErr) }}>{message.text}</div>
        ) : null}

        <Section title="Announcement Bar (top strip)">
          <label style={s.checkboxRow}>
            <input
              type="checkbox"
              checked={!!content.announcement.enabled}
              onChange={(e) => update(['announcement', 'enabled'], e.target.checked)}
            />
            <span>Show announcement bar</span>
          </label>
          <Field label="Announcement text" value={content.announcement.text} onChange={(v) => update(['announcement', 'text'], v)} />
        </Section>

        <Section title="Hero Section">
          <Field label="Eyebrow text" value={content.hero.eyebrow} onChange={(v) => update(['hero', 'eyebrow'], v)} />
          <div style={s.row}>
            <Field label="Headline prefix" value={content.hero.headlinePrefix} onChange={(v) => update(['hero', 'headlinePrefix'], v)} />
            <Field label="Headline accent (gradient words)" value={content.hero.headlineAccent} onChange={(v) => update(['hero', 'headlineAccent'], v)} />
          </div>
          <Field label="Headline suffix" value={content.hero.headlineSuffix} onChange={(v) => update(['hero', 'headlineSuffix'], v)} />
          <Field label="Subheadline" textarea value={content.hero.subheadline} onChange={(v) => update(['hero', 'subheadline'], v)} />
          <div style={s.row}>
            <Field label="Primary CTA text" value={content.hero.ctaPrimaryText} onChange={(v) => update(['hero', 'ctaPrimaryText'], v)} />
            <Field label="Secondary CTA text" value={content.hero.ctaSecondaryText} onChange={(v) => update(['hero', 'ctaSecondaryText'], v)} />
            <Field label="WhatsApp CTA text" value={content.hero.ctaWhatsappText} onChange={(v) => update(['hero', 'ctaWhatsappText'], v)} />
          </div>
          <ListField label="Trending flip-words" items={content.hero.flipWords} onChange={(items) => update(['hero', 'flipWords'], items)} />
          <ImageUploadField
            label="Hero photo (optional — replaces the 3D phone illustration with a real shop photo)"
            value={content.hero.heroImage || ''}
            onChange={(v) => update(['hero', 'heroImage'], v)}
            folder="hero"
          />
        </Section>

        <Section title="Gallery (shop & work photos)">
          {content.gallery.map((g, i) => (
            <div key={i} style={s.card}>
              <ImageUploadField
                label={`Photo ${i + 1}`}
                value={g.url}
                onChange={(v) => update(['gallery', i, 'url'], v)}
                folder="gallery"
              />
              <Field label="Caption (optional)" value={g.caption || ''} onChange={(v) => update(['gallery', i, 'caption'], v)} />
              <button type="button" onClick={() => removeItem(['gallery'], i)} style={s.btnRemove}>Remove photo</button>
            </div>
          ))}
          <button type="button" onClick={() => addItem(['gallery'], { url: '', caption: '' })} style={s.btnAdd}>
            + Add photo
          </button>
        </Section>

        <Section title="Trust Stats (hero counters)">
          {content.stats.map((stat, i) => (
            <div key={i} style={s.row}>
              <Field label="Count" value={stat.count} onChange={(v) => update(['stats', i, 'count'], Number(v) || 0)} small />
              <Field label="Suffix" value={stat.suffix} onChange={(v) => update(['stats', i, 'suffix'], v)} small />
              <Field label="Label" value={stat.label} onChange={(v) => update(['stats', i, 'label'], v)} />
            </div>
          ))}
        </Section>

        <Section title="Brand Marquee">
          <ListField label="Brands shown in the scrolling ticker" items={content.brands} onChange={(items) => update(['brands'], items)} />
        </Section>

        <Section title="Services (Bento Grid)">
          {content.services.map((svc, i) => (
            <div key={i} style={s.card}>
              <div style={s.row}>
                <Field label="Icon (emoji)" value={svc.icon} onChange={(v) => update(['services', i, 'icon'], v)} small />
                <Field label="Title" value={svc.title} onChange={(v) => update(['services', i, 'title'], v)} />
              </div>
              <Field label="Description" textarea value={svc.desc} onChange={(v) => update(['services', i, 'desc'], v)} />
              <div style={s.row}>
                <label style={s.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={!!svc.highlight}
                    onChange={(e) => update(['services', i, 'highlight'], e.target.checked)}
                  />
                  <span>Highlight (gold card)</span>
                </label>
                <Field label="Badge text (optional)" value={svc.badge || ''} onChange={(v) => update(['services', i, 'badge'], v)} />
              </div>
              <button type="button" onClick={() => removeItem(['services'], i)} style={s.btnRemove}>Remove service</button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(['services'], { icon: '⭐', title: 'New Service', desc: 'Description here', highlight: false, badge: '' })}
            style={s.btnAdd}
          >
            + Add service
          </button>
        </Section>

        <Section title="Mobile Accessories — Product Tabs">
          {content.productCategories.map((cat, ci) => (
            <div key={ci} style={s.card}>
              <div style={s.row}>
                <Field label="Tab key (no spaces)" value={cat.key} onChange={(v) => update(['productCategories', ci, 'key'], v)} small />
                <Field label="Tab label" value={cat.label} onChange={(v) => update(['productCategories', ci, 'label'], v)} />
              </div>
              <span style={s.label}>Items</span>
              {cat.items.map((item, ii) => (
                <div key={ii} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input
                    value={item.icon}
                    onChange={(e) => update(['productCategories', ci, 'items', ii, 'icon'], e.target.value)}
                    style={{ ...s.input, width: 56 }}
                  />
                  <input
                    value={item.name}
                    onChange={(e) => update(['productCategories', ci, 'items', ii, 'name'], e.target.value)}
                    style={{ ...s.input, flex: 1 }}
                    placeholder="Item name"
                  />
                  <input
                    value={item.priceFrom || ''}
                    onChange={(e) => update(['productCategories', ci, 'items', ii, 'priceFrom'], e.target.value)}
                    style={{ ...s.input, width: 90 }}
                    placeholder="₹149"
                  />
                  <button type="button" onClick={() => removeItem(['productCategories', ci, 'items'], ii)} style={s.btnRemove}>✕</button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(['productCategories', ci, 'items'], { icon: '📦', name: 'New item', priceFrom: '' })}
                style={s.btnAdd}
              >
                + Add item
              </button>
              <button
                type="button"
                onClick={() => removeItem(['productCategories'], ci)}
                style={{ ...s.btnRemove, marginTop: 10, display: 'block' }}
              >
                Remove entire tab
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(['productCategories'], { key: 'new-tab', label: 'New Tab', items: [] })}
            style={s.btnAdd}
          >
            + Add tab
          </button>
        </Section>

        <Section title="Repairing Features">
          {content.repairFeatures.map((f, i) => (
            <div key={i} style={s.card}>
              <Field label="Title" value={f.title} onChange={(v) => update(['repairFeatures', i, 'title'], v)} />
              <Field label="Description" textarea value={f.desc} onChange={(v) => update(['repairFeatures', i, 'desc'], v)} />
              <button type="button" onClick={() => removeItem(['repairFeatures'], i)} style={s.btnRemove}>Remove</button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(['repairFeatures'], { title: 'New Feature', desc: 'Description here' })}
            style={s.btnAdd}
          >
            + Add feature
          </button>
        </Section>

        <Section title="Live Repair Status Widget">
          <Field label="Status pill text (shown when shop is open)" value={content.repairStatus.pillText} onChange={(v) => update(['repairStatus', 'pillText'], v)} />
          <Field label="Widget title" value={content.repairStatus.title} onChange={(v) => update(['repairStatus', 'title'], v)} />
          <Field label="Widget description" textarea value={content.repairStatus.desc} onChange={(v) => update(['repairStatus', 'desc'], v)} />
          <Field label="Warranty line (optional)" value={content.repairStatus.warranty || ''} onChange={(v) => update(['repairStatus', 'warranty'], v)} />
        </Section>

        <Section title="Testimonials">
          {content.testimonials.map((t, i) => (
            <div key={i} style={s.card}>
              <div style={s.row}>
                <Field label="Customer name" value={t.name} onChange={(v) => update(['testimonials', i, 'name'], v)} />
                <Field label="Location" value={t.location} onChange={(v) => update(['testimonials', i, 'location'], v)} />
                <Field
                  label="Rating (1-5)"
                  value={t.rating}
                  onChange={(v) => update(['testimonials', i, 'rating'], Math.max(1, Math.min(5, Number(v) || 5)))}
                  small
                />
              </div>
              <Field label="Review text" textarea value={t.text} onChange={(v) => update(['testimonials', i, 'text'], v)} />
              <button type="button" onClick={() => removeItem(['testimonials'], i)} style={s.btnRemove}>Remove</button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(['testimonials'], { name: 'Customer Name', location: 'Varanasi', rating: 5, text: 'Great service!' })}
            style={s.btnAdd}
          >
            + Add testimonial
          </button>
        </Section>

        <Section title="FAQs">
          {content.faqs.map((f, i) => (
            <div key={i} style={s.card}>
              <Field label="Question" value={f.q} onChange={(v) => update(['faqs', i, 'q'], v)} />
              <Field label="Answer" textarea value={f.a} onChange={(v) => update(['faqs', i, 'a'], v)} />
              <button type="button" onClick={() => removeItem(['faqs'], i)} style={s.btnRemove}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addItem(['faqs'], { q: 'New question?', a: 'Answer here.' })} style={s.btnAdd}>
            + Add FAQ
          </button>
        </Section>

        <Section title="Contact & Location">
          <div style={s.row}>
            <Field label="Owner / Proprietor name" value={content.contact.owner} onChange={(v) => update(['contact', 'owner'], v)} />
            <Field label="Phone 1 (primary)" value={content.contact.phone1} onChange={(v) => update(['contact', 'phone1'], v)} />
            <Field label="Phone 2 (emergency)" value={content.contact.phone2} onChange={(v) => update(['contact', 'phone2'], v)} />
          </div>
          <Field label="Address" value={content.contact.address} onChange={(v) => update(['contact', 'address'], v)} />
          <Field label="Address with pincode (map card)" value={content.contact.pincodeLine} onChange={(v) => update(['contact', 'pincodeLine'], v)} />
          <Field label="Google Maps search query" value={content.contact.mapsQuery} onChange={(v) => update(['contact', 'mapsQuery'], v)} />
          <div style={s.row}>
            <Field label="Business hours (short, hero card)" value={content.contact.hours} onChange={(v) => update(['contact', 'hours'], v)} />
          </div>
          <div style={s.row}>
            <Field label="Weekday hours (footer)" value={content.contact.hoursWeekday} onChange={(v) => update(['contact', 'hoursWeekday'], v)} />
            <Field label="Sunday hours (footer)" value={content.contact.hoursSunday} onChange={(v) => update(['contact', 'hoursSunday'], v)} />
          </div>
          <div style={s.row}>
            <Field label="Opening time (24hr, e.g. 09:00)" value={content.contact.openTime} onChange={(v) => update(['contact', 'openTime'], v)} small />
            <Field label="Closing time (24hr, e.g. 21:30)" value={content.contact.closeTime} onChange={(v) => update(['contact', 'closeTime'], v)} small />
          </div>
          <p style={s.helperText}>
            Used to power the live &quot;🟢 Open Now / 🔴 Closed&quot; badge — must be 24-hour HH:MM format.
          </p>
          <div style={s.row}>
            <Field label="Google rating (e.g. 4.8)" value={content.contact.googleRating} onChange={(v) => update(['contact', 'googleRating'], v)} small />
            <Field label="Review count (e.g. 120+)" value={content.contact.googleReviewCount} onChange={(v) => update(['contact', 'googleReviewCount'], v)} small />
          </div>
          <Field label="Google review link" value={content.contact.googleReviewUrl} onChange={(v) => update(['contact', 'googleReviewUrl'], v)} />
        </Section>

        <Section title="Footer">
          <Field label="Tagline" textarea value={content.footer.tagline} onChange={(v) => update(['footer', 'tagline'], v)} />
          <Field label="Copyright line" value={content.footer.copyright} onChange={(v) => update(['footer', 'copyright'], v)} />
          <Field label="Brand name" value={content.brand} onChange={(v) => update(['brand'], v)} />
        </Section>

        <div style={s.saveBar}>
          <button onClick={handleSave} disabled={saving} style={s.btnSave} type="button">
            {saving ? 'Publishing…' : '🚀 Save & Publish'}
          </button>
        </div>
      </div>
    </>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#07080c',
    color: '#eef1f8',
    fontFamily: 'system-ui, sans-serif',
    padding: '32px 24px 120px',
    maxWidth: 980,
    margin: '0 auto',
  },
  loadingWrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#07080c',
    color: '#a4abc0',
    fontFamily: 'system-ui, sans-serif',
  },
  thumb: {
    width: 64,
    height: 64,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,.12)',
  },
  previewOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: '#07080c',
    overflowY: 'auto',
  },
  previewBar: {
    position: 'sticky',
    top: 0,
    zIndex: 1001,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    background: '#12141c',
    borderBottom: '1px solid rgba(255,255,255,.09)',
    color: '#eef1f8',
    fontSize: 13,
    fontWeight: 700,
  },
  previewClose: {
    padding: '8px 16px',
    borderRadius: 100,
    border: '1px solid rgba(255,255,255,.15)',
    background: 'rgba(255,255,255,.06)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  },
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  h1: { fontSize: 22, margin: '0 0 6px', fontWeight: 800 },
  hint: { fontSize: 13, color: '#a4abc0', maxWidth: 560, lineHeight: 1.5, margin: 0 },
  message: { padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13.5 },
  messageOk: { background: 'rgba(61,220,151,.12)', border: '1px solid rgba(61,220,151,.35)', color: '#3ddc97' },
  messageErr: { background: 'rgba(255,92,114,.12)', border: '1px solid rgba(255,92,114,.35)', color: '#ff5c72' },
  section: {
    background: '#12141c',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: 16,
    padding: 22,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 15, margin: '0 0 16px', fontWeight: 800, letterSpacing: '.02em' },
  sectionBody: { display: 'flex', flexDirection: 'column', gap: 14 },
  helperText: { fontSize: 12, color: '#6a7189', margin: '-4px 0 0', lineHeight: 1.5 },
  row: { display: 'flex', gap: 14, flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 160 },
  label: { fontSize: 11.5, color: '#a4abc0', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,.12)',
    background: '#0f1119',
    color: '#fff',
    fontSize: 13.5,
    outline: 'none',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,.12)',
    background: '#0f1119',
    color: '#fff',
    fontSize: 13.5,
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#eef1f8', flex: 1 },
  card: {
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: 12,
    padding: 16,
    background: '#0f1119',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  btnAdd: {
    alignSelf: 'flex-start',
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px dashed rgba(47,143,255,.5)',
    background: 'rgba(47,143,255,.08)',
    color: '#6db4ff',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnRemove: {
    alignSelf: 'flex-start',
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,92,114,.35)',
    background: 'rgba(255,92,114,.08)',
    color: '#ff5c72',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnGhost: {
    padding: '10px 16px',
    borderRadius: 100,
    border: '1px solid rgba(255,255,255,.12)',
    background: 'rgba(255,255,255,.05)',
    color: '#eef1f8',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  saveBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '16px 24px',
    background: 'rgba(7,8,12,.9)',
    backdropFilter: 'blur(14px)',
    borderTop: '1px solid rgba(255,255,255,.09)',
    display: 'flex',
    justifyContent: 'center',
  },
  btnSave: {
    padding: '14px 36px',
    borderRadius: 100,
    border: 'none',
    background: 'linear-gradient(120deg,#f5c542,#d99f1f)',
    color: '#171200',
    fontSize: 14.5,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 10px 24px -8px rgba(245,197,66,.5)',
  },
};
