import { useCallback, useRef } from "react";
import "./ClickSpark.css";

export default function ClickSpark({ sparkColor = "#FFD700", sparkSize = 10, sparkRadius = 15, sparkCount = 8, duration = 0.4, children }) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const startTimeRef = useRef(null);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (2 * Math.PI * i) / sparkCount;
      const vx = Math.cos(angle) * sparkSize;
      const vy = Math.sin(angle) * sparkSize;
      sparksRef.current.push({ x, y, vx, vy, life: 1 });
    }
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
      animateSparks();
    }
  }, [sparkCount, sparkSize]);

  const animateSparks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparksRef.current = sparksRef.current.filter(s => s.life > 0);
    if (sparksRef.current.length === 0) { startTimeRef.current = null; return; }
    sparksRef.current.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.life -= 0.04;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.life * sparkRadius, 0, Math.PI * 2);
      ctx.fillStyle = sparkColor;
      ctx.globalAlpha = s.life;
      ctx.fill();
    });
    requestAnimationFrame(animateSparks);
  };

  return (<div style={{ position: "relative", display: "inline-block" }} onClick={handleClick}>
    <canvas ref={canvasRef} className="click-spark-canvas" />
    {children}
  </div>);
}