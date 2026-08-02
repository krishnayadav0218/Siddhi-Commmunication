import { useEffect, useState } from 'react';
import SearchTrigger from './SearchTrigger';
import WishlistButton from './Wishlist';

const NAV_IDS = ['home', 'services', 'accessories', 'repairing', 'contact'];

export default function Header({ content }) {
  const [theme, setTheme] = useState('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const { contact, brand } = content;
  const brandParts = brand.split(' ');
  const brandFirst = brandParts[0];
  const brandRest = brandParts.slice(1).join(' ');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6l-8-4z" fill="#0a0b0f" opacity=".9" />
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
        </nav>

        <div className="header-actions">
          <SearchTrigger content={content} />
          <WishlistButton phone={contact.phone1} />
          <button className="theme-toggle" onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} aria-label="Toggle theme">
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
              </svg>
            )}
          </button>
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
