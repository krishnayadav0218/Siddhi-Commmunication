export default function Marquee({ content }) {
  const brands = content.brands || [];
  const doubled = [...brands, ...brands];
  return (
    <div className="marquee-band">
      <div className="marquee-track">
        {doubled.map((b, i) => (
          <span key={i}>{b}</span>
        ))}
      </div>
    </div>
  );
}
