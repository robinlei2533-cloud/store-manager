import React from "react";

const ShinyText = ({ children, className = "", as: Element = "span", style = {}, speed = 3 }) => {
  return React.createElement(Element, { className, style: { position: "relative", display: "inline-block", ...style } },
    children,
    React.createElement("span", { style: {
      position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
      background: "linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.4) 50%, transparent 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer-slide " + speed + "s ease-in-out infinite",
      pointerEvents: "none",
    }})
  );
};

export default ShinyText;
