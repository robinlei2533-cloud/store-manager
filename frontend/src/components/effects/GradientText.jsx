import React from "react";

const GradientText = ({ children, className = "", as: Element = "span", style = {}, colors = ["#FFD700", "#FFF3B0", "#FFD700"] }) => {
  return React.createElement(Element, { className, style: {
    background: "linear-gradient(135deg, " + colors.join(", ") + ")",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    backgroundSize: "200% auto",
    animation: "uwell-gold-shimmer 3s ease-in-out infinite",
    ...style
  }}, children);
};

export default GradientText;
