import React, { useEffect, useRef } from 'react';

const ARCS = [
  { color: 'rgba(93, 177, 229, 0.18)', start: 5.45, span: 0.72, width: 24, phase: 1.2, radius: 1.02, blur: 15 },
  { color: 'rgba(103, 198, 166, 0.16)', start: 0.63, span: 1.02, width: 26, phase: 2.2, radius: 0.99, blur: 16 },
  { color: 'rgba(225, 191, 106, 0.12)', start: 3.95, span: 1.08, width: 24, phase: 0.0, radius: 1.0, blur: 18 },
  { color: 'rgba(157, 152, 238, 0.09)', start: 5.86, span: 1.24, width: 20, phase: 3.3, radius: 0.94, blur: 19 },
];

function organicPoint(angle, rx, ry, t, phase) {
  const wobble =
    Math.sin(angle * 2.1 + t * 0.42 + phase) * 0.03 +
    Math.sin(angle * 3.7 - t * 0.28 + phase * 0.7) * 0.018;
  return {
    x: Math.cos(angle) * rx * (1 + wobble),
    y: Math.sin(angle) * ry * (1 - wobble * 0.7),
  };
}

function drawOrganicArc(ctx, cx, cy, rx, ry, arc, t, reduceMotion) {
  const steps = 92;
  const phaseShift = reduceMotion ? 0 : t * (0.15 + arc.phase * 0.006);
  const rotation = reduceMotion ? -0.26 : -0.26 + Math.sin(t * 0.24 + arc.phase) * 0.04;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.scale(1.02 + Math.sin(t * 0.22 + arc.phase) * 0.018, 0.98 + Math.cos(t * 0.18 + arc.phase) * 0.012);
  ctx.beginPath();
  for (let i = 0; i <= steps; i += 1) {
    const p = i / steps;
    const angle = arc.start + phaseShift + arc.span * p;
    const point = organicPoint(angle, rx * arc.radius, ry * arc.radius, t, arc.phase);
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = arc.color;
  ctx.lineWidth = arc.width;
  ctx.filter = `blur(${arc.blur}px)`;
  ctx.globalAlpha = 0.82;
  ctx.stroke();
  ctx.filter = `blur(${Math.max(arc.blur - 9, 4)}px)`;
  ctx.lineWidth = arc.width * 0.42;
  ctx.globalAlpha = 0.42;
  ctx.stroke();
  ctx.restore();
}

export default function BioDigitalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let width = 0;
    let height = 0;
    let rafId = 0;
    let start = performance.now();

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      start = performance.now();
    };

    function render(now) {
      const t = (now - start) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.055;
      pointer.y += (pointer.ty - pointer.y) * 0.055;
      ctx.clearRect(0, 0, width, height);

      const narrow = width < 640;
      const orbit = reduceMotion ? 0 : t * 0.22;
      const cx = width * (narrow ? 0.52 : 0.51) + Math.sin(orbit) * (narrow ? 4 : 11) + pointer.x * (narrow ? 5 : 12);
      const cy = height * (narrow ? 0.43 : 0.42) + Math.cos(orbit * 0.82) * (narrow ? 4 : 9) + pointer.y * (narrow ? 5 : 10);
      const base = Math.min(width, height);
      const rx = base * (narrow ? 0.28 : 0.25);
      const ry = base * (narrow ? 0.23 : 0.2);

      const haze = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx * 1.68);
      haze.addColorStop(0, 'rgba(220, 236, 244, 0.03)');
      haze.addColorStop(0.52, 'rgba(199, 226, 235, 0.08)');
      haze.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ARCS.forEach((arc) => drawOrganicArc(ctx, cx, cy, rx, ry, arc, t, reduceMotion));
      ctx.restore();

      if (!reduceMotion) rafId = requestAnimationFrame(render);
    }

    const onPointerMove = (event) => {
      const rect = host.getBoundingClientRect();
      pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    resize();
    window.addEventListener('resize', resize);
    host.addEventListener('pointermove', onPointerMove);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      host.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fe-bio-digital-canvas" aria-hidden="true" />;
}
