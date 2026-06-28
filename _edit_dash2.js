const fs = require('fs');
const path = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\dashboard\\DashboardPage.jsx';
let code = fs.readFileSync(path, 'utf8');

// Replace StatCard's return div with motion.div, remove cardRef
code = code.replace(
  /const StatCard = \({ icon, label, value, color = '#FFD700', delay = 0 }\) => \{\s*const \{ t \} = useLanguageStore\(\);\s*const \[animatedValue, setAnimatedValue\] = useState\(0\);\s*\/\/ Replaced GSAP[\s\S]*?return \(\s*<div ref=\{cardRef\} className="liquid-glass" style=\{/,
  const StatCard = ({ icon, label, value, color = '#FFD700', delay = 0 }) => {
  const { t } = useLanguageStore();
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!value) return;
    const start = performance.now();
    const duration = 1200;
    const numValue = parseInt(value) || 0;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(Math.round(numValue * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: delay * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass"
      style={
);

// Replace the closing div tag of StatCard
code = code.replace(
      </div>
  );
};,
      </motion.div>
  );
};
);

fs.writeFileSync(path, code, 'utf8');
console.log('DASHBOARD StatCard: converted to motion.div. Length:', code.length);
