import { useEffect, useRef } from 'react';

export default function BackgroundFX() {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      { x: 0.18, y: 0.16, r: 0.42, c: '47,143,255', fx: 0.00011, fy: 0.00009, phase: 0 },
      { x: 0.82, y: 0.72, r: 0.38, c: '245,197,66', fx: -0.00009, fy: 0.00013, phase: 2.1 },
      { x: 0.55, y: 0.32, r: 0.3, c: '150,100,255', fx: 0.00013, fy: -0.0001, phase: 4.4 },
    ];
    const stars = Array.from({ length: 60 }, () => ({
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

      ctx.globalCompositeOperation = 'lighter';
      blobs.forEach((b) => {
        const bx = (b.x + Math.sin(time * b.fx + b.phase) * 0.14) * window.innerWidth;
        const by = (b.y + Math.cos(time * b.fy + b.phase) * 0.14) * window.innerHeight;
        const r = b.r * Math.max(window.innerWidth, window.innerHeight);
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0, `rgba(${b.c},.15)`);
        g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      });

      ctx.globalCompositeOperation = 'source-over';
      stars.forEach((st) => {
        const tw = 0.35 + 0.35 * Math.sin(time * 0.0012 + st.phase);
        ctx.beginPath();
        ctx.arc(st.x * window.innerWidth, st.y * window.innerHeight, st.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${tw})`;
        ctx.fill();
        st.y -= st.speed * 0.00006;
        if (st.y < 0) st.y = 1;
      });

      meteors.forEach((m) => {
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(Math.PI / 4);
        const grad = ctx.createLinearGradient(0, 0, m.len, 0);
        grad.addColorStop(0, `rgba(255,255,255,${m.op})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
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
  }, []);

  return (
    <>
      <canvas id="bgCanvas" ref={canvasRef}></canvas>
      <div id="cursorGlow" ref={glowRef}></div>
    </>
  );
}
