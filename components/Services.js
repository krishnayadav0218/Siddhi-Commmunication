import Reveal from './Reveal';

export default function Services({ content }) {
  const { services } = content;

  function handleMove(e) {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--mx', e.clientX - r.left + 'px');
    card.style.setProperty('--my', e.clientY - r.top + 'px');
    card.style.transform = `perspective(800px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-4px)`;
  }
  function handleLeave(e) {
    e.currentTarget.style.transform = '';
  }

  return (
    <section id="services" className="section-pad">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Travel &amp; Online Services</span>
          <h2>Book. Pay. Done — All In One Counter.</h2>
          <p>Instant ticketing and government-service assistance, handled end-to-end by our team.</p>
        </Reveal>
        <Reveal className="bento">
          {services.map((svc, i) => (
            <div
              key={i}
              className={`bento-card${svc.highlight ? ' highlight' : ''}`}
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
            >
              {svc.badge ? <span className="pill-badge">{svc.badge}</span> : null}
              <span className="ic">{svc.icon}</span>
              <div>
                <h3>{svc.title}</h3>
                <p>{svc.desc}</p>
              </div>
              <span className="arrow">↗</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
