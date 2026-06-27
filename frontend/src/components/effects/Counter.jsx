import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function Counter({ from = 0, to = 100, duration = 2, suffix = "", prefix = "", decimals = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(from);
  
  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, from, to, duration]);

  const display = count.toFixed(decimals);
  
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {prefix}{display}{suffix}
    </motion.span>
  );
}