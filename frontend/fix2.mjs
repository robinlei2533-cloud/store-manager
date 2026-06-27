import fs from "fs";
let src = fs.readFileSync("src/pages/fan-entry/FanEntryPage.jsx", "utf8");

// Fix: innerWidth -> window.innerWidth, addEventListener -> window.addEventListener
src = src.replace(/{ W = c.width = innerWidth; H = c.height = innerHeight; };/g, "{ W = c.width = window.innerWidth; H = c.height = window.innerHeight; };");
src = src.replace(/addEventListener\("resize"/g, 'window.addEventListener("resize"');
src = src.replace(/removeEventListener\("resize"/g, 'window.removeEventListener("resize"');

// Also fix the context
src = src.replace(/c\.getContext\("2d"\)/g, 'c.getContext("2d")');

fs.writeFileSync("src/pages/fan-entry/FanEntryPage.jsx", src, "utf8");
console.log("Fixed");
