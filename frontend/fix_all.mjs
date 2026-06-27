import fs from "fs";
let src = fs.readFileSync("src/pages/fan-entry/FanEntryPage.jsx", "utf8");

// 1. Fix LanguageSwitcher call - use inline mode
src = src.replace(
  "<LanguageSwitcher",
  "<LanguageSwitcher inline={true} "
);
// But keep it simple - if already has inline, don't double it
src = src.replace("inline={true} inline={true}", "inline={true}");

// 2. Fix overflow on main container - allow scrolling
src = src.replace(
  "overflowX: 'hidden', minHeight: '100vh'",
  "overflowX: 'hidden', overflowY: 'auto', minHeight: '100vh'"
);

// 3. Extend bottom padding for product strip
src = src.replace(
  "padding:'100px 20px 140px'",
  "padding:'100px 20px 220px'"
);

// 4. Add product strip BEFORE the main content closing and modal
// Find the modal section
const modalComment = "{/* Product Modal */}";
// Insert product strip + Shader overlay reference BEFORE the modal
const productStrip = `
      {/* === Caliburn Product Strip (Fixed Bottom) === */}
      <div style={{
        position:"fixed", bottom:0, left:0, width:"100%", zIndex:15,
        padding:"10px 0",
        background: "linear-gradient(0deg, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0.85) 60%, transparent)",
        overflow: "hidden",
        pointerEvents: "auto",
      }}>
        <div style={{
          display:"flex", gap:14,
          overflowX:"auto", overflowY:"hidden",
          padding:"0 16px 8px",
          scrollbarWidth:"none", msOverflowStyle:"none",
        }}>
          {PD.map((p, i) => (
            <div key={i} onClick={() => openModal(p, PROD_INFO[p.n] || { desc: "UWELL Premium Product", icon: "\u2728" })}
              style={{
                flex:"0 0 auto", width:150, cursor:"pointer",
                borderRadius:10, overflow:"hidden",
                background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,215,0,0.1)",
                transition:"all .3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = p.c; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,215,0,0.1)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ width:"100%", height:110, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.2)" }}>
                <img src={p.i} alt={p.n}
                  style={{ width:"100%", height:"100%", objectFit:"contain", padding:6 }}
                  onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = "<div style=\\"padding:20px;text-align:center;color:rgba(255,255,255,0.2);font-size:30px\\">📦</div>"; }}
                />
              </div>
              <div style={{ padding:"6px 10px" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#e5e5e5", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.n}</div>
                <div style={{ fontSize:8, color:"rgba(255,255,255,0.3)", marginTop:1 }}>{p.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
`;

src = src.replace(modalComment, productStrip + "\n      " + modalComment);

// 5. Add the Shader component definition (inserted before main component)
const mainCompStart = "// ============ Main Component ===";
const shaderCode = `
// ============ Shader/Raster Overlay ============
const ShaderOverlay = () => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let W, H, t = 0, id;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      t += 0.015;
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W/2+Math.sin(t)*120, H/2+Math.cos(t*0.7)*80, 0, W/2, H/2, Math.max(W,H)*0.7);
      g.addColorStop(0, "rgba(255,215,0,0.05)");
      g.addColorStop(0.4, "rgba(255,165,0,0.025)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,215,0,0.012)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 10; i++) {
        const y = (H/10)*i + Math.sin(t*0.8+i*1.2)*25;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < W; x += 4) ctx.lineTo(x, y + Math.sin(x*0.01+t*2.5+i)*2.5);
        ctx.stroke();
      }
      const img = ctx.getImageData(0, 0, W, H);
      for (let i = 0; i < img.data.length; i += 6) {
        const n = (Math.random()-0.5)*10;
        img.data[i] += n; img.data[i+1] += n; img.data[i+2] += n;
      }
      ctx.putImageData(img, 0, 0);
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return React.createElement("canvas", { ref, style: {position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:1,pointerEvents:"none",opacity:0.7} });
};
`;

src = src.replace(mainCompStart, shaderCode + "\n" + mainCompStart);

// 6. Add ShaderOverlay usage after AuroraCanvas
src = src.replace("<AuroraCanvas />", "<AuroraCanvas />\n      <ShaderOverlay />");

fs.writeFileSync("src/pages/fan-entry/FanEntryPage.jsx", src, "utf8");
console.log("All fixes applied");

// Verify key content
const check = fs.readFileSync("src/pages/fan-entry/FanEntryPage.jsx", "utf8");
console.log("ShaderOverlay components:", (check.match(/ShaderOverlay/g) || []).length);
console.log("inlinetrue:", check.includes("inline={true}"));
console.log("Product Strip:", check.includes("Caliburn Product Strip"));
console.log("overflowY auto:", check.includes("overflowY: 'auto'"));
