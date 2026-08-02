import LogoMark from './Logo';

export default function Footer({ content }) {
  const { contact, footer, brand } = content;
  const brandParts = brand.split(' ');
  const brandFirst = brandParts[0];
  const brandRest = brandParts.slice(1).join(' ');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapsQuery)}`;

  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" className="logo">
              <span className="logo-mark">
                <LogoMark />
              </span>
              <span>
                {brandFirst}
                {brandRest ? <em> {brandRest}</em> : null}
              </span>
            </a>
            <p>{footer.tagline}</p>
            <div className="social-row">
              <a href={`https://wa.me/91${contact.phone1}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">💬</a>
              <a href={`tel:+91${contact.phone1}`} aria-label="Call">📞</a>
              <a href={mapsUrl} target="_blank" rel="noreferrer" aria-label="Location">📍</a>
            </div>
          </div>
          <div>
            <h4>QUICK LINKS</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#accessories">Mobile Accessories</a></li>
              <li><a href="#repairing">Repairing</a></li>
            </ul>
          </div>
          <div>
            <h4>BUSINESS HOURS</h4>
            <ul>
              <li>{contact.hoursWeekday}</li>
              <li>{contact.hoursSunday}</li>
            </ul>
            <div className="emergency-strip">
              Emergency repair: <strong>+91 {contact.phone2}</strong>
            </div>
          </div>
          <div>
            <h4>CONTACT</h4>
            <ul>
              <li>{contact.owner}</li>
              <li>+91 {contact.phone1}</li>
              <li>+91 {contact.phone2}</li>
              <li>{contact.address}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{footer.copyright}</span>
          <span>Designed for Khojwa Bazar, Varanasi</span>
        </div>
      </div>
    </footer>
  );
}
