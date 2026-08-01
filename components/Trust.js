import Reveal from './Reveal';

export default function Trust({ content }) {
  const { contact, brand } = content;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapsQuery)}`;

  return (
    <section id="contact" className="section-pad">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Visit The Store</span>
          <h2>Trusted Across Khojwa Bazar</h2>
          <p>Walk in, call, or message us — we&apos;re happy to help with anything on this page.</p>
        </Reveal>
        <Reveal className="trust-cards">
          <div className="location-card">
            {contact.googleRating ? (
              <div className="rating-badge">
                <span className="stars-mini" aria-hidden="true">★★★★★</span>
                <strong>{contact.googleRating}</strong>
                <span className="rating-count">({contact.googleReviewCount} reviews)</span>
                {contact.googleReviewUrl ? (
                  <a href={contact.googleReviewUrl} target="_blank" rel="noreferrer" className="rate-us-link">
                    Rate us ↗
                  </a>
                ) : null}
              </div>
            ) : null}
            <div className="row">
              <span className="ic">📍</span>
              <div>
                <h4>Location</h4>
                <p className="val">{contact.address}</p>
              </div>
            </div>
            <div className="row">
              <span className="ic">👤</span>
              <div>
                <h4>Proprietor</h4>
                <p className="val">{contact.owner}</p>
              </div>
            </div>
            <div className="row">
              <span className="ic">📞</span>
              <div>
                <h4>Contact Numbers</h4>
                <p className="val">
                  +91 {contact.phone1} &nbsp;·&nbsp; +91 {contact.phone2}
                </p>
              </div>
            </div>
            <div className="row">
              <span className="ic">🕒</span>
              <div>
                <h4>Business Hours</h4>
                <p className="val">{contact.hours}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <a href={`tel:+91${contact.phone1}`} className="btn btn-primary">📞 Call Now</a>
              <a href={`https://wa.me/91${contact.phone1}`} target="_blank" rel="noreferrer" className="btn btn-ghost">
                💬 WhatsApp
              </a>
            </div>
          </div>
          <div className="map-card">
            <iframe
              className="map-frame"
              src={`https://www.google.com/maps?q=${encodeURIComponent(contact.mapsQuery)}&output=embed`}
              width="100%"
              height="220"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${brand} location map`}
            ></iframe>
            <div className="map-overlay">
              <h3>{brand}</h3>
              <p>{contact.pincodeLine}</p>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-gold btn-sm">
                Open in Google Maps ↗
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
