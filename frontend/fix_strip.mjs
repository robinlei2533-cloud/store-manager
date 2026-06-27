import fs from "fs";
let src = fs.readFileSync("src/pages/fan-entry/FanEntryPage.jsx", "utf8");

// 1. Remove overflowX hidden from main container - allows scrolling
src = src.replace("overflowX: 'hidden',", "overflowX: 'hidden',\n      overflowY: 'auto',");

// 2. Move the product strip OUTSIDE the modal. 
// The product strip is between modal content closing and modal overlay closing.
// Extract it and place it BEFORE the modal code.

// Find the product strip section
const stripStart = src.indexOf("{/* === Caliburn Product Strip === */}");
const stripEnd = src.indexOf("</div>", stripStart);
// Find the actual end of the product strip container (the fixed div)
const stripEnd2 = src.indexOf("</div>", stripEnd + 6);
const stripEnd3 = src.indexOf("</div>", stripEnd2 + 6);

// Extract the product strip
const stripCode = src.substring(stripStart, stripEnd3 + 6);

// Remove the product strip from its current location
src = src.replace(stripCode, "");

// Insert the product strip BEFORE the modal code, but AFTER the main content section
const modalStart = src.indexOf("{/* Product Modal */}");
src = src.substring(0, modalStart) + "\n" + stripCode + "\n" + src.substring(modalStart);

// 3. Fix the main content padding to leave room for product strip
src = src.replace("padding:'100px 20px 140px'", "padding:'100px 20px 200px'");

fs.writeFileSync("src/pages/fan-entry/FanEntryPage.jsx", src, "utf8");
console.log("Fixed product strip position");
