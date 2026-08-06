import { useMemo, useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';

const TENURES = [3, 6, 9, 12, 18, 24];

export function formatINR(n) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function calcEMI(principal, annualRatePct, months) {
  const P = Number(principal) || 0;
  const n = Number(months) || 1;
  if (P <= 0) return { emi: 0, totalPayable: 0, totalInterest: 0 };

  const r = (Number(annualRatePct) || 0) / 12 / 100;
  if (r === 0) {
    const emi = P / n;
    return { emi, totalPayable: P, totalInterest: 0 };
  }
  const factor = Math.pow(1 + r, n);
  const emi = (P * r * factor) / (factor - 1);
  const totalPayable = emi * n;
  return { emi, totalPayable, totalInterest: totalPayable - P };
}

// Fully manual, customer-operated EMI calculator: the customer types their
// own amount (or drags the slider), picks tenure, and can toggle between
// a no-cost (0%) EMI or type in their own card's interest rate — nothing
// is pre-decided for them. Reused on the homepage banner and on the
// standalone /emi-calculator page.
export default function EMICalculator({ contact, initialAmount = 5000 }) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(initialAmount);
  const [tenure, setTenure] = useState(6);
  const [noCost, setNoCost] = useState(true);
  const [rate, setRate] = useState(13);

  const effectiveRate = noCost ? 0 : rate;
  const { emi, totalPayable, totalInterest } = useMemo(
    () => calcEMI(amount, effectiveRate, tenure),
    [amount, effectiveRate, tenure]
  );

  return (
    <div className="emi-calc">
      <h4 className="emi-calc-title">{t('emiCalcTitle')}</h4>
      <p className="emi-calc-sub">Type any amount, pick a tenure, and see your monthly installment instantly — fully manual, no guesswork.</p>

      <label className="emi-field">
        <span>{t('emiAmount')}</span>
        <div className="emi-amount-row">
          <span className="emi-rupee">₹</span>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          />
        </div>
        <input
          type="range"
          min="500"
          max="60000"
          step="500"
          value={Math.min(amount, 60000)}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="emi-slider"
        />
      </label>

      <label className="emi-field">
        <span>{t('emiTenure')}</span>
        <div className="emi-tenure-row">
          {TENURES.map((m) => (
            <button
              key={m}
              type="button"
              className={`emi-tenure-btn${tenure === m ? ' active' : ''}`}
              onClick={() => setTenure(m)}
            >
              {m}mo
            </button>
          ))}
        </div>
      </label>

      <label className="emi-toggle-row">
        <input type="checkbox" checked={noCost} onChange={(e) => setNoCost(e.target.checked)} />
        <span>{t('emiNoCost')}</span>
      </label>

      {!noCost ? (
        <label className="emi-field">
          <span>{t('emiRate')}</span>
          <input
            type="number"
            min="0"
            max="36"
            step="0.5"
            value={rate}
            onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
            className="emi-rate-input"
          />
        </label>
      ) : null}

      <div className="emi-result">
        <div className="emi-result-main">
          <span>{t('emiMonthly')}</span>
          <strong>{formatINR(emi)}<span className="emi-per-mo">/mo</span></strong>
        </div>
        <div className="emi-result-grid">
          <div>
            <span>{t('emiTotalPayable')}</span>
            <strong>{formatINR(totalPayable)}</strong>
          </div>
          <div>
            <span>{t('emiTotalInterest')}</span>
            <strong>{formatINR(totalInterest)}</strong>
          </div>
        </div>
      </div>

      <a
        className="btn btn-primary btn-block"
        href={`https://wa.me/91${contact.phone1}?text=${encodeURIComponent(
          `Hi, I want to buy something worth ${formatINR(amount)} on EMI (${tenure} months). Please confirm availability.`
        )}`}
        target="_blank"
        rel="noreferrer"
      >
        💬 Confirm EMI on WhatsApp
      </a>
      <p className="emi-disclaimer">Indicative only — final EMI depends on your bank/card issuer's terms.</p>
    </div>
  );
}
