import React from "react";

const PageTransition = ({ children, className = "", style = {} }) => {
  const transitionClassName = ["uw-page-transition", className].filter(Boolean).join(" ");

  return (
    <div className={transitionClassName} style={style}>
      {children}
    </div>
  );
};

export default PageTransition;
