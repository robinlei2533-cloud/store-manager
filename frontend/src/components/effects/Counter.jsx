import { useRef, useState, useEffect } from "react";

export default function Counter({ from = 0, to = 100, duration = 2, suffix = "", prefix = "", decimals = 0 }) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [count, setCount] = useState(from);

  useEffect(() => {
    const element = ref.current;
    if (!element || isInView) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsInView(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isInView]);
  
  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    let frameId;
    const animate = (now) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(from + (to - from) * eased);
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, from, to, duration]);

  const display = count.toFixed(decimals);
  
  return (
    <span
      ref={ref}
      className={`uw-counter${isInView ? " is-visible" : ""}`}
    >
      {prefix}{display}{suffix}
    </span>
  );
}
