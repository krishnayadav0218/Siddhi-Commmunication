// The brand icon: a phone/device with signal waves — reads as both "mobile
// shop" and "communication services" at a glance. Meant to sit inside the
// gradient `.logo-mark` badge (see globals.css), so it's drawn in a single
// flat white with varying opacity for depth, keeping it legible at any size.
export default function LogoMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7.5" y="3" width="8" height="15" rx="2.4" stroke="#fff" strokeWidth="1.6" />
      <circle cx="11.5" cy="15" r="0.95" fill="#fff" />
      <path d="M17.3 7.2a6.2 6.2 0 0 1 0 9.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".85" />
      <path d="M19.6 4.9a9.6 9.6 0 0 1 0 14.2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}
