import React, { useRef, useEffect, useState, useCallback } from "react";

const CountUp = ({ value = 0, duration = 1.5, decimals = 0, className = "", style = {}, prefix = "", suffix = "", separator = "," }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.unobserve(entry.target); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const easeOutCubic = useCallback((t) => 1 - Math.pow(1 - t, 3), []);

  useEffect(() => {
    if (!visible) return;
    let startTime = null;
    const numValue = Number(value) || 0;
    let animId;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      setDisplayValue(easeOutCubic(progress) * numValue);
      if (progress < 1) animId = requestAnimationFrame(animate);
      else setDisplayValue(numValue);
    };
    animId = requestAnimationFrame(animate);
    return () => { if (animId) cancelAnimationFrame(animId); };
  }, [visible, value, duration, easeOutCubic]);

  const formatNumber = (num) => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join(".");
  };

  return React.createElement("span", { ref, className, style }, prefix + formatNumber(displayValue) + suffix);
};

export default CountUp;
