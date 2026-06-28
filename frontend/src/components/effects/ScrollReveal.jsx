import React, { useRef, useEffect, useState } from "react";

const ScrollReveal = ({ children, className = "", style = {}, y = 30, duration = 0.6, delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.unobserve(entry.target); }
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return React.createElement("div", { ref, className, style: {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(" + y + "px)",
    transition: "all " + duration + "s cubic-bezier(0.16,1,0.3,1) " + delay + "s",
    ...style
  }}, children);
};

export default ScrollReveal;
