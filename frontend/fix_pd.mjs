import fs from "fs";
let src = fs.readFileSync("src/pages/fan-entry/FanEntryPage.jsx", "utf8");

// Replace the PD array with complete Caliburn product list
const newPD = `const PD = [
  {n:"CALIBURN AIR",c:"#ff6b35",t:"Flagship Series",i:"https://files.myuwell.com/UWELLl/ow-home-banner/AIR%20PC%20banner%20%203840-1620-20260616092816517.jpg"},
  {n:"CALIBURN G5",c:"#457bff",t:"Flagship Series",i:"https://files.myuwell.com/UWELLl/ow-home-banner/G5-banner-3840-1620-20260421160504521.jpg"},
  {n:"G5 KOKO",c:"#6c5ce7",t:"Flagship Series",i:"https://files.myuwell.com/UWELLl/ow-home-banner/G5%20KOKO-BANNER-3840x1620-20260108144156453.png"},
  {n:"G5 LITE SE",c:"#00b894",t:"Lite Series",i:"https://files.myuwell.com/UWELLl/ow-home-banner/G5%20Lite%20%26%20Lite%20SE-BANNER-3840x1620-20251210144711254.png"},
  {n:"G5 LITE KOKO",c:"#fd79a8",t:"Lite Series",i:"https://files.myuwell.com/UWELLl/ow-home-banner/G5-Lite-KOKO-banner-3840-1620-20251210135848829.jpg"},
  {n:"G4 PRO",c:"#a29bfe",t:"Professional Series",i:"https://files.myuwell.com/uwell/ow-product-color/Pearl%20Silver-20250626134143970.png"},
  {n:"G4 CLASSIC",c:"#fdcb6e",t:"Classic Series",i:"https://files.myuwell.com/uwell/ow-product-color/Classic%20Silver-20250818115904349.png"},
  {n:"G4 PRO KOKO",c:"#e17055",t:"KOKO Series",i:"https://files.myuwell.com/uwell/ow-product-color/Cosmic%20Gray-20250904100830831.png"},
  {n:"G4 MINI",c:"#00cec9",t:"Mini Series",i:"https://files.myuwell.com/uwell/ow-product-ip/caliburn-20240522105241962.png"},
  {n:"G3 PRO",c:"#fd79a8",t:"Professional Series",i:"https://files.myuwell.com/uwell/ow-product-ip/caliburn-20240627113220107.webp"},
  {n:"G3 PRO KOKO",c:"#6c5ce7",t:"KOKO Series",i:"https://files.myuwell.com/uwell/ow-product-ip/crown-20240522104947608.png"},
  {n:"Caliburn OG",c:"#e17055",t:"Classic Series",i:"https://files.myuwell.com/uwell/ow-product-ip/caliburn-20240522105241962.png"},
  {n:"Crown",c:"#fdcb6e",t:"Pod Series",i:"https://files.myuwell.com/UWELLl/ow-product-ip/CROWN-20240627113158744.webp"},
  {n:"Havok",c:"#00cec9",t:"Pod Series",i:"https://files.myuwell.com/UWELLl/ow-product-ip/havok-20240522105356154.png"},
];`;

const pdStart = src.indexOf("const PD = [");
const pdEnd = src.indexOf("];", pdStart) + 2;
src = src.substring(0, pdStart) + newPD + src.substring(pdEnd);

fs.writeFileSync("src/pages/fan-entry/FanEntryPage.jsx", src, "utf8");
console.log("PD array updated with", (newPD.match(/{n:"/g) || []).length, "products");
