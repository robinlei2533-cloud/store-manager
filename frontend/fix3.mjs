import fs from "fs";

// Fix LanguageSwitcher - merge style prop
let src = fs.readFileSync("src/components/common/LanguageSwitcher.jsx", "utf8");

// Find the container div style and add ...style spread
src = src.replace(
  '<div style={{ position: inline ? \'relative\' : (position || \'fixed\'), top: inline ? undefined : top, right: inline ? undefined : right, zIndex, display: \'flex\', flexDirection: \'column\', alignItems: \'flex-end\' }}>',
  '<div style={{ ...(style || {}), position: inline ? \'relative\' : (position || \'fixed\'), top: inline ? undefined : top, right: inline ? undefined : right, zIndex, display: \'flex\', flexDirection: \'column\', alignItems: \'flex-end\' }}>'
);

fs.writeFileSync("src/components/common/LanguageSwitcher.jsx", src, "utf8");
console.log("LanguageSwitcher fixed");
