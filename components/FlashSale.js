import { useEffect, useState } from 'react';
import Reveal from './Reveal';

function computeTimeLeft(endsAt) {
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(end)) return null;
  const diff = end - Date.now();
  if (diff <= 0) return { expired: true };
  return {
    expired: false,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

function TimeBox({ value, label }) {
  return (
    <div className="time-box">
      <span className="time-value">{String(value).padStart(2, '0')}</span>
      <span className="time-label">{label}</span>
    </div>
  );
}

export default function FlashSale({ content }) {
  const sale = content.flashSale;
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!sale || !sale.enabled || !sale.endsAt) return;
    function tick() {
      setTimeLeft(computeTimeLeft(sale.endsAt));
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [sale]);

  if (!sale || !sale.enabled || !sale.endsAt) return null;
  if (!timeLeft || timeLeft.expired) return null;

  return (
    <div className="flash-sale-section">
      <div className="wrap">
        <Reveal className="flash-sale-card">
          <div className="flash-sale-info">
            <span className="flash-sale-tag">⚡ Limited Time</span>
            <h3>{sale.title}</h3>
            <p>{sale.desc}</p>
          </div>
          <div className="flash-sale-timer">
            <TimeBox value={timeLeft.days} label="Days" />
            <TimeBox value={timeLeft.hours} label="Hrs" />
            <TimeBox value={timeLeft.mins} label="Min" />
            <TimeBox value={timeLeft.secs} label="Sec" />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
