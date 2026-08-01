import { useEffect, useState } from 'react';
import Reveal from './Reveal';
import { getISTClockParts, isShopOpenNow, formatTimeLabel } from '../lib/time';

export default function Repair({ content }) {
  const { repairFeatures, repairStatus, contact } = content;
  const [clock, setClock] = useState({ time: '--:--', ampm: '' });
  const [isOpen, setIsOpen] = useState(null);

  useEffect(() => {
    function update() {
      setClock(getISTClockParts());
      setIsOpen(isShopOpenNow(contact.openTime, contact.closeTime));
    }
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [contact.openTime, contact.closeTime]);

  return (
    <section id="repairing" className="section-pad">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Repairing &amp; Software Hub</span>
          <h2>Professional Repairs, Done Right</h2>
          <p>Certified hands-on repair for screens, boards and software — plus everyday printing needs.</p>
        </Reveal>
        <div className="repair-grid">
          <Reveal className="repair-features">
            {repairFeatures.map((f, i) => (
              <div className="repair-feat" key={i}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
            {repairStatus.warranty ? (
              <div className="warranty-strip">
                <span className="warranty-ic">🛡️</span> {repairStatus.warranty}
              </div>
            ) : null}
          </Reveal>
          <Reveal className="status-widget">
            <span className={`status-pill${isOpen === false ? ' status-pill-closed' : ''}`}>
              <span className="pulse"></span>{' '}
              {isOpen === null
                ? 'Checking status…'
                : isOpen
                ? repairStatus.pillText
                : `CLOSED NOW · Opens ${formatTimeLabel(contact.openTime)}`}
            </span>
            <h3>{repairStatus.title}</h3>
            <p>{repairStatus.desc}</p>
            <div className="status-clock">
              {clock.time}
              <span> {clock.ampm} IST</span>
            </div>
            <a
              href={`https://wa.me/91${contact.phone1}?text=I%20need%20mobile%20repairing%20service`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold btn-glow"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Book a Repair Slot
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
