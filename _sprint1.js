const fs = require("fs");
const file = "C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend/src/pages/fan-entry/FanEntryPage.jsx";
let lines = fs.readFileSync(file, "utf8").split("\n");

// Find the extra closing div before </header>
// Line 378: </div> (closes settings div - line 342)
// Line 379: </div> (closes buttons container - line 340)
// Line 380: </div> (EXTRA - should not be here)
// Line 381: </header>

// The structure should be:
// Line 340: <div flex> (buttons container - opens)
// Line 342: <div position:relative> (settings - opens)
// ...
// Line 378: </div> (settings - closes line 342)
// Line 379: </div> (buttons - closes line 340)
// Line 380: </header>

// Remove the extra </div> at line 380
if (lines[380].trim() === "</div>") {
  lines.splice(380, 1);
  console.log("Removed extra </div> at line 380");
}

fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log("Fixed");
