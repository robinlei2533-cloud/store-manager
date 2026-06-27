import fs from "fs";
let src = fs.readFileSync("src/pages/fan-entry/FanEntryPage.jsx", "utf8");

// Insert ShaderOverlay component definition between MeteorShower and FanEntryPage
const shaderCode = `
// ============ Shader/Raster Overlay (ChromaFlow + FlutedGlass + FilmGrain) ============
const ShaderOverlay = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let W, H, t = 0, id;
    const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
    resize();
    addEventListener("resize", resize);
    const draw = () => {
      t += 0.015;
      ctx.clearRect(0, 0, W, H);
      // ChromaFlow radial gradient
      const g = ctx.createRadialGradient(W/2+Math.sin(t)*120, H/2+Math.cos(t*0.7)*80, 0, W/2, H/2, Math.max(W,H)*0.7);
      g.addColorStop(0, "rgba(255,215,0,0.05)");
      g.addColorStop(0.4, "rgba(255,165,0,0.025)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // FlutedGlass refraction lines
      ctx.strokeStyle = "rgba(255,215,0,0.012)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 10; i++) {
        const y = (H/10)*i + Math.sin(t*0.8+i*1.2)*25;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < W; x += 4) ctx.lineTo(x, y + Math.sin(x*0.01+t*2.5+i)*2.5);
        ctx.stroke();
      }
      // FilmGrain noise overlay
      const img = ctx.getImageData(0, 0, W, H);
      for (let i = 0; i < img.data.length; i += 6) {
        const n = (Math.random()-0.5)*10;
        img.data[i] += n; img.data[i+1] += n; img.data[i+2] += n;
      }
      ctx.putImageData(img, 0, 0);
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:1,pointerEvents:"none",opacity:0.7}} />;
};

`;

// Insert before "// ============ Main Component ============"
src = src.replace("// ============ Main Component ============", shaderCode + "// ============ Main Component ============");

fs.writeFileSync("src/pages/fan-entry/FanEntryPage.jsx", src, "utf8");
console.log("ShaderOverlay inserted");

// Verify
const check = fs.readFileSync("src/pages/fan-entry/FanEntryPage.jsx", "utf8");
console.log("ShaderOverlay count:", (check.match(/ShaderOverlay/g) || []).length);
