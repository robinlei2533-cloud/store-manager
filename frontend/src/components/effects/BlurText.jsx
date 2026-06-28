import React, { useRef, useEffect, useState } from "react";

const BlurText = ({ text = "", delay = 0.04, className = "", as: Element = "h2", style = {} }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.unobserve(entry.target); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return React.createElement(Element, { ref, className, style: { display: "flex", flexWrap: "wrap", gap: "0.1em", ...style } },
    text.split("").map((char, i) =>
      React.createElement("span", { key: i, style: {
        display: "inline-block",
        filter: visible ? "blur(0px)" : "blur(10px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(15px)",
        transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) " + (i * delay) + "s",
      }}, char === " " ? "\u00A0" : char)
    )
  );
};

export default BlurText;
