import { useState } from 'react';
import Reveal from './Reveal';

export default function FAQ({ content }) {
  const faqs = content.faqs || [];
  const [openIndex, setOpenIndex] = useState(0);
  if (!faqs.length) return null;

  return (
    <section className="section-pad">
      <div className="wrap wrap-narrow">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Good To Know</span>
          <h2>Frequently Asked Questions</h2>
          <p>Still curious about something? Message us on WhatsApp anytime.</p>
        </Reveal>
        <Reveal className="faq-list">
          {faqs.map((f, i) => (
            <div className={`faq-item${openIndex === i ? ' open' : ''}`} key={i}>
              <button className="faq-q" onClick={() => setOpenIndex(openIndex === i ? -1 : i)} type="button">
                <span>{f.q}</span>
                <span className="faq-icon">{openIndex === i ? '−' : '+'}</span>
              </button>
              <div className="faq-a">
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
