import React, { useState, useEffect } from "react";

const RotatingText = ({ texts = [], period = 3000, className = "", style = {} }) => {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  useEffect(() => {
    if (texts.length === 0) return;
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => { setIndex((p) => (p + 1) % texts.length); setAnimating(false); }, 300);
    }, period);
    return () => clearInterval(interval);
  }, [texts.length, period]);
  const text = texts[index] || "";
  return React.createElement("span", { className, style: { display: "inline-block", ...style } },
    React.createElement("span", { style: {
      display: "inline-block", opacity: animating ? 0 : 1,
      transform: animating ? "translateY(-10px)" : "translateY(0)",
      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
    }}, text)
  );
};

export default RotatingText;
