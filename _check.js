const fs = require("fs");
const file = "C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend/src/components/common/LanguageSwitcher.jsx";
const lines = fs.readFileSync(file, "utf8").split("\n");
for (let i = 0; i < 8; i++) console.log(i + ": " + lines[i]);
