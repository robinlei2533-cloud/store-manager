const fs = require("fs");
const file = "C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend/src/pages/fan-entry/FanEntryPage.jsx";
const lines = fs.readFileSync(file, "utf8").split("\n");
// Show header area - find the opening header and the structure
for (let i = 325; i < 385; i++) {
  console.log(i + ": " + lines[i]);
}
