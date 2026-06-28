import React, { useRef, useEffect, useState, useCallback } from "react";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
const DecryptedText = ({ text = "", className = "", style = {}, speed = 50, trigger = "hover" }) => {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef(null);
  const hasTriggered = useRef(false);

  const start = useCallback(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    let iteration = 0;
    const maxIter = text.length * 2;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplayText(text.split("").map((char, i) => {
        if (char === " ") return " ";
        if (i < iteration / 2) return text[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(""));
      iteration++;
      if (iteration >= maxIter) { clearInterval(intervalRef.current); setDisplayText(text); }
    }, speed);
  }, [text, speed]);

  const cleanup = useCallback(() => { clearInterval(intervalRef.current); setDisplayText(text); }, [text]);

  useEffect(() => { if (trigger === "view") start(); return () => clearInterval(intervalRef.current); }, [trigger, text]);

  return React.createElement("span", {
    className, style: { cursor: trigger === "hover" ? "pointer" : "default", ...style },
    onMouseEnter: trigger === "hover" ? start : undefined,
    onMouseLeave: trigger === "hover" ? cleanup : undefined,
  }, displayText);
};

export default DecryptedText;
