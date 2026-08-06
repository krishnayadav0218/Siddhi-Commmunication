import Reveal from './Reveal';
import EMICalculator from './EMICalculator';

export default function EMIInfo({ content }) {
  const cfg = content.emi || {};
  if (!cfg.enabled) return null;

  return (
    <Reveal className="emi-banner">
      <div className="emi-banner-grid">
        <div className="emi-info-col">
          <div className="emi-banner-head">
            <span className="emi-ic">💳</span>
            <div>
              <h4>{cfg.title}</h4>
              <p>{cfg.desc}</p>
            </div>
          </div>
          <div className="emi-options">
            {(cfg.options || []).map((opt, i) => (
              <div className="emi-option" key={i}>
                <span>{opt.icon}</span>
                <div>
                  <strong>{opt.label}</strong>
                  <p>{opt.note}</p>
                </div>
              </div>
            ))}
          </div>
          <a href="/emi-calculator" className="emi-fullpage-link">Open full-page calculator →</a>
        </div>
        <EMICalculator contact={content.contact} />
      </div>
    </Reveal>
  );
}
