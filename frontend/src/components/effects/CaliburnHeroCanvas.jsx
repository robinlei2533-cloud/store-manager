import React, { useEffect, useRef } from 'react';

const ORBS = [
  { x: 0.32, y: 0.27, mx: 0.27, my: 0.24, size: 104, depth: 0.95, phase: 0.3, spin: 0.28 },
  { x: 0.64, y: 0.22, mx: 0.70, my: 0.20, size: 96, depth: 0.82, phase: 1.8, spin: -0.22 },
  { x: 0.80, y: 0.38, mx: 0.78, my: 0.38, size: 82, depth: 0.68, phase: 3.1, spin: 0.20 },
  { x: 0.16, y: 0.52, mx: 0.18, my: 0.47, size: 90, depth: 0.74, phase: 4.2, spin: -0.24 },
  { x: 0.42, y: 0.64, mx: 0.38, my: 0.63, size: 86, depth: 0.86, phase: 5.2, spin: 0.24 },
  { x: 0.66, y: 0.56, mx: 0.64, my: 0.56, size: 78, depth: 0.76, phase: 2.5, spin: -0.18 },
];

function loadProductImages(products) {
  return products.slice(0, ORBS.length).map((product) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = product.i;
    return { product, image, ready: false };
  });
}

function drawProductCore(ctx, item, radius, angle) {
  ctx.save();
  ctx.rotate(angle);

  if (item.ready && item.image.naturalWidth > 0) {
    const ratio = item.image.naturalWidth / item.image.naturalHeight;
    const maxW = radius * 0.88;
    const maxH = radius * 0.92;
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    ctx.shadowColor = 'rgba(20, 18, 15, 0.22)';
    ctx.shadowBlur = radius * 0.12;
    ctx.shadowOffsetY = radius * 0.05;
    ctx.globalAlpha = 0.96;
    ctx.drawImage(item.image, -w / 2, -h / 2, w, h);
  } else {
    const core = ctx.createLinearGradient(-radius * 0.2, -radius * 0.52, radius * 0.24, radius * 0.52);
    core.addColorStop(0, '#f9f8f2');
    core.addColorStop(0.18, item.product.c || '#c8a236');
    core.addColorStop(0.34, '#1a1713');
    core.addColorStop(0.7, '#050505');
    core.addColorStop(1, '#f7f3e7');
    ctx.beginPath();
    ctx.roundRect(-radius * 0.22, -radius * 0.52, radius * 0.44, radius * 1.04, radius * 0.18);
    ctx.fillStyle = core;
    ctx.fill();
  }

  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.ellipse(-radius * 0.15, -radius * 0.22, radius * 0.28, radius * 0.12, -0.45, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  ctx.fill();
  ctx.restore();
}

function drawOrb(ctx, orb, item, width, height, pointer, t, reduceMotion) {
  const narrow = width < 560;
  const drift = reduceMotion ? 0 : Math.sin(t * 0.48 + orb.phase);
  const sway = reduceMotion ? 0 : Math.cos(t * 0.36 + orb.phase * 1.7);
  const cx = (narrow ? orb.mx : orb.x) * width + drift * 16 * orb.depth + pointer.x * 24 * orb.depth;
  const cy = (narrow ? orb.my : orb.y) * height + sway * 13 * orb.depth + pointer.y * 18 * orb.depth;
  const radius = Math.min(orb.size * (0.74 + orb.depth * 0.28), Math.min(width, height) * 0.15);
  const angle = orb.phase + t * orb.spin * (reduceMotion ? 0 : 1);

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.24 * orb.depth;
  ctx.filter = 'blur(16px)';
  ctx.beginPath();
  ctx.ellipse(cx + 6, cy + radius * 0.72, radius * 0.54, radius * 0.18, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(52, 50, 43, 0.34)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  const glow = ctx.createRadialGradient(cx - radius * 0.22, cy - radius * 0.28, radius * 0.1, cx, cy, radius * 0.66);
  glow.addColorStop(0, 'rgba(255,255,255,0.98)');
  glow.addColorStop(0.42, 'rgba(213,232,247,0.9)');
  glow.addColorStop(1, 'rgba(126,176,216,0.58)');
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.76)';
  ctx.stroke();

  ctx.globalAlpha = 0.34;
  ctx.beginPath();
  ctx.arc(cx - radius * 0.12, cy - radius * 0.18, radius * 0.46, Math.PI * 0.9, Math.PI * 1.64);
  ctx.strokeStyle = 'rgba(255,255,255,0.86)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.translate(cx, cy);
  drawProductCore(ctx, item, radius, angle);
  ctx.restore();
}

export default function CaliburnHeroCanvas({ products = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const items = loadProductImages(products);
    let width = 0;
    let height = 0;
    let rafId = 0;
    let start = performance.now();

    items.forEach((item) => {
      item.image.onload = () => {
        item.ready = true;
        if (reduceMotion) render(performance.now());
      };
      item.image.onerror = () => {
        item.ready = false;
      };
    });

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

    const drawMist = (t) => {
      for (let i = 0; i < 3; i += 1) {
        const x = width * (0.25 + i * 0.23) + Math.sin(t * 0.16 + i) * 22;
        const y = height * (0.42 + Math.sin(i) * 0.08) + Math.cos(t * 0.2 + i) * 18;
        const r = width * (0.11 + i * 0.018);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, 'rgba(159, 203, 236, 0.12)');
        gradient.addColorStop(1, 'rgba(159, 203, 236, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    };

    function render(now) {
      const t = (now - start) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.055;
      pointer.y += (pointer.ty - pointer.y) * 0.055;
      ctx.clearRect(0, 0, width, height);
      drawMist(t);
      ORBS.slice()
        .sort((a, b) => a.depth - b.depth)
        .forEach((orb, index) => drawOrb(ctx, orb, items[index % Math.max(items.length, 1)] || { product: {}, ready: false }, width, height, pointer, t, reduceMotion));
      if (!reduceMotion) rafId = requestAnimationFrame(render);
    }

    const onPointerMove = (event) => {
      const rect = host.getBoundingClientRect();
      pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    resize();
    host.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', resize);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      host.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
    };
  }, [products]);

  return <canvas ref={canvasRef} className="fe-luxury-canvas" aria-hidden="true" />;
}
