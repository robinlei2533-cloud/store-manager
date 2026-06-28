const fs = require('fs');
const path = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\components\\layout\\AppLayout.jsx';
let code = fs.readFileSync(path, 'utf8');

// Fix the broken if (!profile) block - add back the return with Spin
code = code.replace(
  "  if (!profile) {\n    \n  return (",
    if (!profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const getMenuItems = () => {
);

// Add import for motion from framer-motion
code = code.replace(
  "import { IS_LOCAL_MODE } from '../../services/api';",
  "import { IS_LOCAL_MODE } from '../../services/api';\nimport { motion } from 'framer-motion';"
);

// Wrap Content with motion.div for page transitions
code = code.replace(
  "<Content ref={contentRef} style={{",
  "<Content style={{"
);

// Add motion wrapper inside Content for the Outlet
code = code.replace(
  "          <Outlet />\n        </Content>",
            <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </Content>
);

fs.writeFileSync(path, code, 'utf8');
console.log('APPLAYOUT: fixed. Length:', code.length);
