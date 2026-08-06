import { useEffect, useState } from 'react';
import SearchTrigger from './SearchTrigger';
import WishlistButton from './Wishlist';
import LogoMark from './Logo';
import ThemePicker from './ThemePicker';
import { useLanguage } from '../lib/LanguageContext';
import { usePWAInstall } from '../lib/usePWAInstall';

const NAV_IDS = ['home', 'services', 'accessories', 'repairing', 'contact'];

export default function Header({ content }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const { contact, brand } = content;
  const { lang, setLang, t } = useLanguage();
  const { canInstall, promptInstall } = usePWAInstall();
  const brandParts = brand.split(' ');
  const brandFirst = brandParts[0];
  const brandRest = brandParts.slice(1).join(' ');

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <div className="nav">
        <a href="#home" className="logo">
          <span className="logo-mark">
            <LogoMark />
          </span>
          <span>
            {brandFirst}
            {brandRest ? <em> {brandRest}</em> : null}
          </span>
        </a>

        <nav
          id="primary-navigation"
          className="links"
          style={
            menuOpen
              ? {
                  display: 'flex',
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  flexDirection: 'column',
                  padding: '20px 28px',
                  background: 'var(--bg-panel)',
                  borderBottom: '1px solid var(--glass-border)',
                  gap: 18,
                }
              : {}
          }
        >
          <a href="#home" className={active === 'home' ? 'active-link' : ''} onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#services" className={active === 'services' ? 'active-link' : ''} onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#accessories" className={active === 'accessories' ? 'active-link' : ''} onClick={() => setMenuOpen(false)}>Mobile Accessories</a>
          <a href="#repairing" className={active === 'repairing' ? 'active-link' : ''} onClick={() => setMenuOpen(false)}>Repairing</a>
          <a href="#contact" className={active === 'contact' ? 'active-link' : ''} onClick={() => setMenuOpen(false)}>Contact Us</a>
          <a href="/track-order" onClick={() => setMenuOpen(false)}>📦 {t('trackOrder')}</a>
        </nav>

        <div className="header-actions">
          <div className="lang-toggle">
            <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            <button type="button" className={lang === 'hi' ? 'active' : ''} onClick={() => setLang('hi')}>हि</button>
          </div>
          {canInstall ? (
            <button type="button" className="install-app-btn" onClick={promptInstall}>
              📲 <span className="full">{t('installApp')}</span>
            </button>
          ) : null}
          <SearchTrigger content={content} />
          <WishlistButton phone={contact.phone1} />
          <ThemePicker />
          <a href={`tel:+91${contact.phone1}`} className="btn btn-ghost btn-sm">📞 Call</a>
          <a
            href={`https://wa.me/91${contact.phone1}?text=Hi%20${encodeURIComponent(brand)}%2C%20I%27d%20like%20to%20enquire.`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
          >
            <span className="full">WhatsApp</span> 💬
          </a>
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
          >
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
