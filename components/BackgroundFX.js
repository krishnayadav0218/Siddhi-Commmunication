import { useEffect, useRef } from 'react';
import { useTheme } from '../lib/ThemeContext';

// Per-theme blob glow colors (as "r,g,b" strings) and star tone, so the
// animated background always matches whichever color theme is active —
// including the new "Pulse" theme, which reproduces the soft cyan/teal
// glow-cloud look from the reference design.
const THEME_FX = {
  dark: {
    blobs: ['139,92,246', '255,176,32', '255,61,129', '34,211,238'],
    star: '255,255,255',
  },
  pulse: {
    blobs: ['20,184,166', '34,211,238', '94,234,212', '251,113,133'],
    star: '255,255,255',
  },
  light: {
    blobs: ['139,92,246', '255,176,32', '255,61,129', '34,211,238'],
    star: '30,20,50',
  },
};

export default function BackgroundFX() {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fx = THEME_FX[theme] || THEME_FX.dark;
    const isLight = theme === 'light';
    let raf;
    let dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    const blobs = [
      { x: 0.14, y: 0.16, r: 0.42, c: fx.blobs[0], fx: 0.00013, fy: 0.0001, phase: 0 },
      { x: 0.86, y: 0.68, r: 0.38, c: fx.blobs[1], fx: -0.0001, fy: 0.00014, phase: 2.1 },
      { x: 0.5, y: 0.3, r: 0.28, c: fx.blobs[2], fx: 0.00015, fy: -0.00011, phase: 4.4 },
      { x: 0.26, y: 0.8, r: 0.26, c: fx.blobs[3], fx: -0.00012, fy: -0.00009, phase: 1.3 },
    ];
    const starCount = isLight ? 40 : 70;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.4,
      speed: Math.random() * 0.3 + 0.08,
      phase: Math.random() * Math.PI * 2,
    }));
    let meteors = [];
    function spawnMeteor() {
      meteors.push({
        x: Math.random() * window.innerWidth * 0.7 + window.innerWidth * 0.15,
        y: -40,
        len: Math.random() * 130 + 70,
        speed: Math.random() * 5 + 5,
        op: 1,
      });
    }
    const meteorTimer = setInterval(() => {
      if (Math.random() < 0.55) spawnMeteor();
    }, 2400);

    function frame(time) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
      blobs.forEach((b) => {
        const bx = (b.x + Math.sin(time * b.fx + b.phase) * 0.14) * window.innerWidth;
        const by = (b.y + Math.cos(time * b.fy + b.phase) * 0.14) * window.innerHeight;
        const r = b.r * Math.max(window.innerWidth, window.innerHeight);
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0, `rgba(${b.c},${isLight ? 0.08 : 0.15})`);
        g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      });

      ctx.globalCompositeOperation = 'source-over';
      stars.forEach((st) => {
        const tw = 0.35 + 0.35 * Math.sin(time * 0.0012 + st.phase);
        ctx.beginPath();
        ctx.arc(st.x * window.innerWidth, st.y * window.innerHeight, st.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${fx.star},${isLight ? tw * 0.35 : tw})`;
        ctx.fill();
        st.y -= st.speed * 0.00006;
        if (st.y < 0) st.y = 1;
      });

      meteors.forEach((m) => {
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(Math.PI / 4);
        const grad = ctx.createLinearGradient(0, 0, m.len, 0);
        grad.addColorStop(0, `rgba(${fx.star},${m.op})`);
        grad.addColorStop(1, `rgba(${fx.star},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(m.len, 0);
        ctx.stroke();
        ctx.restore();
        m.x += m.speed * 0.7;
        m.y += m.speed * 0.7;
        m.op -= 0.012;
      });
      meteors = meteors.filter((m) => m.op > 0 && m.y < window.innerHeight + 100);

      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    function handleVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        raf = requestAnimationFrame(frame);
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    function handleMouseMove(e) {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
        glowRef.current.style.opacity = '1';
      }
    }
    function handleMouseLeave() {
      if (glowRef.current) glowRef.current.style.opacity = '0';
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(meteorTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [theme]);

  return (
    <>
      <canvas id="bgCanvas" ref={canvasRef}></canvas>
      <div id="cursorGlow" ref={glowRef}></div>
    </>
  );
}
