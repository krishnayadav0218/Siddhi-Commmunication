import { useState } from 'react';
import Reveal from './Reveal';

export default function CallbackForm({ content }) {
  const { contact, brand } = content;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please enter your name and phone number.');
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    const text =
      `Hi ${brand}, please call me back.%0A` +
      `Name: ${encodeURIComponent(name.trim())}%0A` +
      `Phone: ${encodeURIComponent(digits)}%0A` +
      `Message: ${encodeURIComponent(message.trim() || '—')}`;
    window.open(`https://wa.me/91${contact.phone1}?text=${text}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <section className="section-pad">
      <div className="wrap wrap-narrow">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Prefer Not To Call?</span>
          <h2>Request A Callback</h2>
          <p>Fill this in and we&apos;ll reach out on WhatsApp — usually within the hour during business hours.</p>
        </Reveal>
        <Reveal>
          <form className="callback-form" onSubmit={handleSubmit}>
            <div className="callback-row">
              <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <input
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
              />
            </div>
            <textarea
              placeholder="What do you need help with? (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            {error ? <p className="callback-error">{error}</p> : null}
            <button type="submit" className="btn btn-gold btn-glow">
              📩 Send via WhatsApp
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
