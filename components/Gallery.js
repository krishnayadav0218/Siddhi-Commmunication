import Reveal from './Reveal';

export default function Gallery({ content }) {
  const items = content.gallery || [];
  if (!items.length) return null;

  return (
    <section className="section-pad gallery-section">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Take A Look Inside</span>
          <h2>Our Shop &amp; Recent Work</h2>
          <p>A quick look at the counter, and some recent repairs we&apos;re proud of.</p>
        </Reveal>
        <Reveal className="gallery-grid">
          {items.map((g, i) =>
            g.url ? (
              <div className="gallery-item" key={i}>
                <img src={g.url} alt={g.caption || content.brand} loading="lazy" />
                {g.caption ? <span className="gallery-caption">{g.caption}</span> : null}
              </div>
            ) : null
          )}
        </Reveal>
      </div>
    </section>
  );
}
