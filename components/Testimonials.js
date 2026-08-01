import Reveal from './Reveal';

export default function Testimonials({ content }) {
  const testimonials = content.testimonials || [];
  if (!testimonials.length) return null;

  return (
    <section className="section-pad testimonials-section">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Customer Love</span>
          <h2>What Khojwa Bazar Says</h2>
          <p>Real feedback from customers who walked in for a repair, a ticket, or just a cable.</p>
        </Reveal>
        <Reveal className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="stars" aria-hidden="true">
                {'★'.repeat(t.rating)}
                {'☆'.repeat(Math.max(0, 5 - t.rating))}
              </div>
              <p className="quote">&ldquo;{t.text}&rdquo;</p>
              <div className="author">
                <div className="avatar">{t.name.charAt(0)}</div>
                <div>
                  <div className="name">{t.name}</div>
                  <div className="loc">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
