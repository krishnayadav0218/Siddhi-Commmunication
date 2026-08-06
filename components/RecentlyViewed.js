import { useRecentlyViewed } from '../lib/useRecentlyViewed';
import { useLanguage } from '../lib/LanguageContext';
import Reveal from './Reveal';

export default function RecentlyViewed({ onOpenProduct }) {
  const { items } = useRecentlyViewed();
  const { t } = useLanguage();

  if (!items.length) return null;

  return (
    <Reveal className="recently-viewed">
      <h4 className="recently-viewed-title">🕒 {t('recentlyViewed')}</h4>
      <div className="recently-viewed-strip">
        {items.map((it) => (
          <button key={it.id} type="button" className="recently-viewed-card" onClick={() => onOpenProduct?.(it)}>
            <span>{it.icon}</span>
            <div className="recently-viewed-name">{it.name}</div>
            {it.priceFrom ? <div className="recently-viewed-price">{it.priceFrom}</div> : null}
          </button>
        ))}
      </div>
    </Reveal>
  );
}
