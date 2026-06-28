import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function useEntranceAnimation(selectors, options = {}) {
  const ref = useRef(null);
  const { stagger = 0.08, duration = 0.5, ease = "power3.out", y = 20, deps = [] } = options;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;
      const selectorsArr = Array.isArray(selectors) ? selectors : [selectors];
      const items = [];
      selectorsArr.forEach((sel) => {
        const els = ref.current ? ref.current.querySelectorAll(sel) : document.querySelectorAll(sel);
        els.forEach((el) => items.push(el));
      });
      if (items.length === 0) return;
      gsap.fromTo(items, { opacity: 0, y: y }, { opacity: 1, y: 0, duration, stagger, ease, clearProps: "y" });
    }, ref);
    return () => ctx.revert();
  }, deps);
  return ref;
}
