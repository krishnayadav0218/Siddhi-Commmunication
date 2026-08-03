// New brand icon for the vibrant redesign: a phone silhouette with a bold
// lightning bolt through it — reads as "powered up / energetic" (fits an
// accessories & charging shop) while staying simple enough to work at any
// size, from a 16px favicon to a big hero badge.
export default function LogoMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="3.2" stroke="#fff" strokeWidth="1.7" opacity=".9" />
      <circle cx="12" cy="18.3" r="0.9" fill="#fff" opacity=".9" />
      <path d="M13.6 4.6 9 12.4h3.1l-1 6.8 5.9-9.1h-3.4l1-5.5z" fill="#fff" />
    </svg>
  );
}
