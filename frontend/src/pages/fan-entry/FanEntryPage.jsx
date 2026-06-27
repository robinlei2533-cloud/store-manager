import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { Spin } from 'antd';

// ============ Product Data (from fan-entry.html) ============
const PD = [
  {n:"CALIBURN AIR",c:"#ff6b35",t:"旗舰系列",i:"https://files.myuwell.com/uwell/ow-home-banner/AIR%20PC%20banner%20%203840-1620-20260616092816517.jpg"},
  {n:"CALIBURN G5",c:"#457bff",t:"旗舰系列",i:"https://files.myuwell.com/uwell/ow-home-banner/G5-banner-3840-1620-20260421160504521.jpg"},
  {n:"G5 KOKO",c:"#6c5ce7",t:"旗舰系列",i:"https://files.myuwell.com/uwell/ow-home-banner/G5%20KOKO-BANNER-3840x1620-20260108144156453.png"},
  {n:"G5 LITE SE",c:"#00b894",t:"Lite 系列",i:"https://files.myuwell.com/uwell/ow-home-banner/G5%20Lite%20%26%20Lite%20SE-BANNER-3840x1620-20251210144711254.png"},
  {n:"G5 LITE KOKO",c:"#fd79a8",t:"Lite 系列",i:"https://files.myuwell.com/uwell/ow-home-banner/G5-Lite-KOKO-banner-3840-1620-20251210135848829.jpg"},
  {n:"Caliburn",c:"#e17055",t:"经典系列",i:"https://files.myuwell.com/uwell/ow-product-ip/caliburn-20240627113220107.webp"},
  {n:"Crown",c:"#fdcb6e",t:"大烟雾系列",i:"https://files.myuwell.com/uwell/ow-product-ip/CROWN-20240627113158744.webp"},
  {n:"Havok",c:"#00cec9",t:"大烟雾系列",i:"https://files.myuwell.com/uwell/ow-product-ip/havok-20240522105356154.png"},
  {n:"200-X100",c:"#a29bfe",t:"专业系列",i:"https://files.myuwell.com/uwell/ow-product-ip/200X-20240522105129735.png"},
  {n:"Conjure",c:"#fd79a8",t:"专业系列",i:"https://files.myuwell.com/uwell/ow-product-ip/conjure-20240522105509254.png"},
  {n:"Atop Flow",c:"#00b894",t:"专业系列",i:"https://files.myuwell.com/uwell/ow-product-ip/atop-flow-20240627113127696.webp"},
];
const PROD_INFO = {
  "CALIBURN AIR":{desc:"极致纤薄的气流感应电子烟",specs:[["型号","CALIBURN AIR"],["烟弹容量","2.0ml"],["电池","400mAh"]],icon:"⚡"},
  "CALIBURN G5":{desc:"UWELL 第五代旗舰系列",specs:[["型号","CALIBURN G5"],["烟弹容量","2.5ml"],["电池","520mAh"]],icon:"🔥"},
  "Caliburn":{desc:"开创 CALIBURN 时代的经典之作",specs:[["型号","Caliburn OG"],["烟弹容量","2.0ml"],["电池","520mAh"]],icon:"🏆"},
};

const COLORS = { gold: '#FFD700', warmGold: '#F5A623', dark: '#0a0a0f' };

// ============ Particle Canvas Component ============
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const x = c.getContext('2d');
    let W, H, ms = null, animId;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const CS = ["rgba(255,215,0,","rgba(69,123,255,","rgba(108,92,231,","rgba(0,206,201,","rgba(255,255,255,"];
    const N = 90;
    const ps = [];
    for (let i = 0; i < N; i++) {
      ps.push({
        x: Math.random()*W, y: Math.random()*H, s: 1.8+Math.random()*3.2,
        vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6,
        o: 0.2+Math.random()*0.4, ci: Math.floor(Math.random()*CS.length), ps: 0.01+Math.random()*0.02
      });
    }
    const onMouse = (e) => { ms = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { ms = null; };
    document.addEventListener('mousemove', onMouse);
    document.addEventListener('mouseleave', onLeave);
    let tt = 0;
    const animate = () => {
      tt += 0.016;
      x.clearRect(0, 0, W, H);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        if (ms) {
          const dx = p.x - ms.x, dy = p.y - ms.y, d = Math.sqrt(dx*dx+dy*dy);
          if (d < 150) { const f = (150-d)/150*0.8; p.vx += (dx/d||0)*f; p.vy += (dy/d||0)*f; }
        }
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.97; p.vy *= 0.97;
        if (p.x < -10) p.x = W+10; if (p.x > W+10) p.x = -10;
        if (p.y < -10) p.y = H+10; if (p.y > H+10) p.y = -10;
        const op = p.o * (0.5 + 0.5 * Math.sin(tt * p.ps));
        x.beginPath(); x.arc(p.x, p.y, p.s, 0, Math.PI*2);
        x.fillStyle = CS[p.ci] + op + ')'; x.fill();
        x.beginPath(); x.arc(p.x, p.y, p.s*3, 0, Math.PI*2);
        x.fillStyle = CS[p.ci] + (op*0.08) + ')'; x.fill();
        for (let j = i+1; j < ps.length; j++) {
          const p2 = ps[j], dx2 = p.x-p2.x, dy2 = p.y-p2.y, d2 = Math.sqrt(dx2*dx2+dy2*dy2);
          if (d2 < 100) {
            x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p2.x, p2.y);
            x.strokeStyle = 'rgba(255,255,255,'+((1-d2/100)*0.12)+')'; x.lineWidth = 0.5; x.stroke();
          }
        }
        if (ms) {
          const dx3 = p.x-ms.x, dy3 = p.y-ms.y, d3 = Math.sqrt(dx3*dx3+dy3*dy3);
          if (d3 < 100) {
            x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(ms.x, ms.y);
            x.strokeStyle = 'rgba(255,215,0,'+((1-d3/100)*0.2)+')'; x.lineWidth = 1; x.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMouse);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:1, pointerEvents:'none' }} />;
};

// ============ Aurora Canvas Component ============
const AuroraCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const x = c.getContext('2d');
    let W, H, cl = 0, animId;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const auroras = [];
    for (let i = 0; i < 3; i++) {
      auroras.push({
        x: W*0.2+Math.random()*W*0.6, y: H*0.1+Math.random()*H*0.3,
        w: 300+Math.random()*400, h: 100+Math.random()*150,
        c1: 'hsla('+(35+Math.random()*25)+',90%,55%,0.18)',
        c2: 'hsla('+(40+Math.random()*20)+',85%,45%,0.12)',
        sp: 0.1+Math.random()*0.2, ph: Math.random()*6.28
      });
    }
    const animate = () => {
      x.clearRect(0, 0, W, H); cl += 0.005;
      for (let i = 0; i < auroras.length; i++) {
        const a = auroras[i];
        a.x += Math.sin(cl * a.sp + a.ph) * 0.3;
        for (let j = 0; j < 3; j++) {
          const off = (j-1) * a.w * 0.3;
          const grad = x.createRadialGradient(a.x+off, a.y+j*30, 0, a.x+off, a.y+j*30, a.w);
          grad.addColorStop(0, i === 0 ? a.c1 : a.c2);
          grad.addColorStop(1, 'transparent');
          x.fillStyle = grad;
          x.fillRect(a.x+off-a.w, a.y+j*30-a.h, a.w*2, a.h*2);
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none' }} />;
};


// ============ Meteor Shower Component ============
const MeteorShower = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let W, H, animId;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);

    // Meteor class
    class Meteor {
      constructor() {
        this.reset();
      }
      reset() {
        // Spawn from top-right area: wide horizontal, narrow vertical
        this.x = W * 0.5 + Math.random() * W * 0.6;
        this.y = -20 - Math.random() * H * 0.3;
        // Speed: fast diagonal toward bottom-left
        const speed = 6 + Math.random() * 10;
        const angle = Math.PI * 0.15 + Math.random() * Math.PI * 0.2; // 27°-63° from horizontal
        this.vx = -Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        // Add slight gravity
        this.gravity = 0.05 + Math.random() * 0.05;
        // Trail
        this.trail = [];
        this.maxTrail = 12 + Math.floor(Math.random() * 8);
        // Visual
        this.size = 2 + Math.random() * 3;
        this.brightness = 0.6 + Math.random() * 0.4;
        // Color: gold spectrum
        const goldHue = 38 + Math.floor(Math.random() * 18); // 38-56 (gold to orange)
        this.colorHead = `hsla(${goldHue}, 100%, 75%, ${this.brightness})`;
        this.colorTail = `hsla(${goldHue}, 100%, 60%, 0.5)`;
        // Lifetime
        this.age = 0;
        this.maxAge = 80 + Math.floor(Math.random() * 60);
        this.alive = true;
        // Glow
        this.glowSize = this.size * 4;
      }
      update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
        // Store trail position
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) this.trail.shift();
        // Fade out near end of life
        if (this.age > this.maxAge - 20) {
          this.brightness *= 0.92;
        }
        // Die when off screen or too old
        if (this.x < -50 || this.x > W + 50 || this.y > H + 50 || this.age > this.maxAge) {
          this.alive = false;
        }
      }
      draw(ctx) {
        // Draw trail (oldest to newest)
        for (let i = 0; i < this.trail.length; i++) {
          const t = this.trail[i];
          const ratio = i / this.trail.length;
          const alpha = ratio * this.brightness * 0.6;
          const trailSize = this.size * ratio * 0.8;
          ctx.beginPath();
          ctx.arc(t.x, t.y, Math.max(trailSize, 0.5), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(42, 100%, 65%, ${alpha})`;
          ctx.fill();
        }
        // Draw meteor head with glow
        if (this.trail.length > 0) {
          const head = this.trail[this.trail.length - 1];
          // Outer glow
          const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, this.glowSize);
          glow.addColorStop(0, `rgba(255,215,0,${this.brightness * 0.3})`);
          glow.addColorStop(1, 'rgba(255,215,0,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(head.x - this.glowSize, head.y - this.glowSize, this.glowSize * 2, this.glowSize * 2);
          // Bright core
          ctx.beginPath();
          ctx.arc(head.x, head.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${this.brightness})`;
          ctx.fill();
          // Inner gold
          ctx.beginPath();
          ctx.arc(head.x, head.y, this.size * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = this.colorHead;
          ctx.fill();
        }
      }
    }

    const meteors = [];
    let spawnTimer = 0;
    const maxMeteors = 8;

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      // Spawn logic
      spawnTimer++;
      if (spawnTimer > 12 - Math.floor(Math.random() * 8) && meteors.length < maxMeteors) {
        const m = new Meteor();
        // Random burst: sometimes spawn 2-3 at once
        meteors.push(m);
        if (Math.random() < 0.2) {
          const m2 = new Meteor();
          m2.x = m.x + (Math.random() - 0.5) * 60;
          m2.y = m.y - Math.random() * 40;
          meteors.push(m2);
        }
        spawnTimer = 0;
      }
      // Update & draw
      for (let i = meteors.length - 1; i >= 0; i--) {
        meteors[i].update();
        meteors[i].draw(ctx);
        if (!meteors[i].alive) meteors.splice(i, 1);
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:2, pointerEvents:'none' }} />;
};

// ============ Main Component ============
const FanEntryPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('🇺🇸 EN');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [visibleCards, setVisibleCards] = useState(false);
  const gridRef = useRef(null);

  // Staggered product card entrance
  useEffect(() => {
    const t = setTimeout(() => setVisibleCards(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = useCallback(() => {
    const userEmail = email || 'fan@uwell.com';
    const fanId = 'fan-' + Date.now();
    localStorage.setItem('store_manager_current_user', fanId);
    navigate('/fan-center', { replace: true });
  }, [email, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleLogin();
  }, [handleLogin]);

  const openModal = (p, info) => {
    setModalProduct({ product: p, info });
    setModalOpen(true);
  };

  return (
    <div style={{
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',Arial,sans-serif",
      background: COLORS.dark, color: '#fff', overflowX: 'hidden', minHeight: '100vh', width: '100vw',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Background layers */}
      <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:0,
        background: 'radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #0a0a0f 60%, #000 100%)' }} />
      <AuroraCanvas />
      <ParticleCanvas />
      <MeteorShower />
      <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:3, pointerEvents:'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)' }} />

      {/* Header */}
      <header style={{
        position:'fixed', top:0, left:0, width:'100%', zIndex:50,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'16px 32px',
        background: 'linear-gradient(180deg, rgba(10,10,15,0.8) 0%, transparent 100%)',
        WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{
            fontSize:22, fontWeight:900, letterSpacing:3,
            background: 'linear-gradient(135deg, #fff 30%, #FFD700 70%, #F5A623)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>UWELL</span>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#FFD700', animation:'pulse 2s ease-in-out infinite' }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Settings */}
          <div style={{ position:'relative' }}>
            <button
              onClick={() => { setSettingsOpen(!settingsOpen); if(langDropdownOpen) setLangDropdownOpen(false); }}
              style={{
                width:38, height:38, borderRadius:10, border:'1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', color: settingsOpen ? '#FFD700' : 'rgba(255,255,255,0.5)',
                fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all .3s', transform: settingsOpen ? 'rotate(60deg)' : 'none',
              }}
            >⚙</button>
            {settingsOpen && (
              <div style={{
                position:'absolute', top:'calc(100% + 8px)', right:0, minWidth:200,
                background:'rgba(20,20,30,0.95)', WebkitBackdropFilter:'blur(20px)', backdropFilter:'blur(20px)',
                border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:6, zIndex:100,
                boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
              }}>
                <div onClick={() => navigate('/store-owner')} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .2s' }}
                  onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.target.style.background='transparent'}>
                  <span style={{fontSize:16,width:28,textAlign:'center'}}>🏪</span> 门店进入
                </div>
                <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'4px 8px' }} />
                <div onClick={() => navigate('/admin')} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .2s' }}
                  onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.target.style.background='transparent'}>
                  <span style={{fontSize:16,width:28,textAlign:"center"}}>🔐</span> 管理后台 Panel
                </div>
                <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'4px 8px' }} />
                <a href="https://www.myuwell.com" target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600, cursor:'pointer', textDecoration:'none' }}
                  onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.target.style.background='transparent'}>
                  <span style={{fontSize:16,width:28,textAlign:'center'}}>🌐</span> UWELL 官网
                </a>
              </div>
            )}
          </div>
          {/* Language */}
          <div style={{ position:'relative' }}>
            <button
              onClick={() => { setLangDropdownOpen(!langDropdownOpen); if(settingsOpen) setSettingsOpen(false); }}
              style={{
                width:38, height:38, borderRadius:10, border:'1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)',
                fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                letterSpacing: '0.5px', transition:'all .3s',
              }}
            >{currentLang}</button>
            {langDropdownOpen && (
              <div style={{
                position:'absolute', top:'calc(100% + 8px)', right:0, minWidth:160,
                background:'rgba(20,20,30,0.95)', WebkitBackdropFilter:'blur(20px)', backdropFilter:'blur(20px)',
                border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:6, zIndex:100,
                boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
              }}>
                {[
                  { lang: 'en', label: 'English', flag: '🇺🇸' },
                  { lang: 'zh', label: '中文', flag: '🇨🇳' },
                  { lang: 'ar', label: 'العربية', flag: '🇸🇦' },
                ].map(item => (
                  <div key={item.lang} onClick={() => { setCurrentLang(item.flag + ' ' + item.label.split(' ').pop()); setLangDropdownOpen(false); }}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600, cursor:'pointer' }}
                    onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.target.style.background='transparent'}>
                    <span>{item.flag}</span> {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ position:'relative', zIndex:20, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'100px 20px 140px' }}>
        {/* Hero */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:60, width:'100%', maxWidth:1100, minHeight:'80vh', padding:'60px 0 40px' }}>
          <div style={{ flex:1, maxWidth:480 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:20, background:'rgba(255,215,0,0.12)', border:'1px solid rgba(255,215,0,0.25)', fontSize:11, fontWeight:700, letterSpacing:2, color:'#FFD700', textTransform:'uppercase', marginBottom:20 }}>
              ✦ 2026 粉丝俱乐部
            </div>
            <h1 style={{ fontSize:48, fontWeight:900, lineHeight:1.15, letterSpacing:-1, marginBottom:16 }}>
              <span style={{ background:'linear-gradient(135deg,#fff 30%,#FFD700)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>加入 UWELL</span><br />
              <span style={{ background:'linear-gradient(135deg,#457bff,#6c5ce7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>粉丝俱乐部</span>
            </h1>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:15, lineHeight:1.7, marginBottom:28 }}>
              签到累积积分、扫码认证产品、解锁会员等级、兑换专属好礼 — 和全球 UWELL 粉丝一起探索更纯粹的体验。
            </p>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
              {['每日签到','扫码积分','积分商城','会员等级'].map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'linear-gradient(135deg,#FFD700,#F5A623)' }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex:1, maxWidth:400 }}>
            <div style={{ background:'rgba(255,255,255,0.04)', WebkitBackdropFilter:'blur(20px)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'32px 28px', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
              <div style={{ width:50, height:3, background:'linear-gradient(90deg,#FFD700,#457bff)', borderRadius:2, margin:'0 auto 18px' }} />
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <h2 style={{ fontSize:20, fontWeight:800, letterSpacing:2, color:'#fff', marginBottom:4 }}>粉丝登录</h2>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:12, letterSpacing:1 }}>使用邮箱快速加入</p>
              </div>
              <div style={{ marginBottom:14 }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="邮箱地址" autoComplete="email"
                  style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' }}
                />
              </div>
              <div style={{ marginBottom:14 }}>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="密码" autoComplete="current-password"
                  style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' }}
                />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'16px 0 20px' }}>
                <label style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.3)', fontSize:12, cursor:'pointer' }}>
                  <input type="checkbox" defaultChecked /> 记住我
                </label>
                <a href="#" style={{ color:'rgba(255,255,255,0.3)', fontSize:12, textDecoration:'none' }}>忘记密码?</a>
              </div>
              <button onClick={handleLogin} style={{
                width:'100%', padding:13, border:'none', borderRadius:10,
                background:'linear-gradient(135deg,#FFD700,#F5A623)',
                color:'#0a0a0f', fontSize:14, fontWeight:700, letterSpacing:2,
                cursor:'pointer', transition:'all .3s', position:'relative', overflow:'hidden',
              }}>登 录</button>
              <div style={{ textAlign:'center', marginTop:14 }}>
                <a href="#" style={{ color:'rgba(255,255,255,0.3)', fontSize:12, cursor:'pointer', textDecoration:'none' }}>
                  还没有账号？<span style={{ color:'#FFD700', fontStyle:'normal', fontWeight:600 }}>立即注册</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Product Showcase */}
        <div style={{ width:'100%', maxWidth:1200, margin:'20px auto 0', padding:'0 20px' }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px', borderRadius:20, background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.15)', fontSize:10, fontWeight:700, letterSpacing:2, color:'#FFD700', textTransform:'uppercase', marginBottom:12 }}>✦ 产品家族</div>
            <h2 style={{ fontSize:28, fontWeight:900, letterSpacing:1, marginBottom:8 }}>
              <span style={{ background:'linear-gradient(135deg,#fff,#FFD700 60%,#F5A623)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>探索 UWELL 明星产品</span>
            </h2>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, letterSpacing:1 }}>从经典到旗舰，总有一款适合你</p>
          </div>
          <div ref={gridRef} style={{
            display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16,
          }}>
            {PD.map((p, idx) => {
              const info = PROD_INFO[p.n] || { desc: 'UWELL 优质产品', icon: '✨' };
              return (
                <div key={p.n} onClick={() => openModal(p, info)} style={{
                  position:'relative', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
                  borderRadius:16, padding:'24px 20px 20px', overflow:'hidden', cursor:'pointer',
                  transition:'all .6s cubic-bezier(0.34,1.56,0.64,1)',
                  opacity: visibleCards ? 1 : 0, transform: visibleCards ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.92)',
                  transitionDelay: (idx * 0.06) + 's',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'; e.currentTarget.style.borderColor = 'rgba(255,215,0,0.2)'; e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    position:'absolute', top:'-50%', left:'-50%', width:'200%', height:'200%',
                    borderRadius:'50%', opacity:0.06, transition:'opacity .5s', pointerEvents:'none',
                    background: 'radial-gradient(circle,'+p.c+',transparent 70%)',
                  }} />
                  <div style={{ width:'100%', height:150, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, position:'relative', zIndex:1 }}>
                    <img src={p.i} alt={p.n} loading="lazy"
                      style={{ maxWidth:'90%', maxHeight:'100%', objectFit:'contain', filter:'drop-shadow(0 8px 24px rgba(0,0,0,0.6))', transition:'transform .6s cubic-bezier(0.34,1.56,0.64,1)' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.12) translateY(-4px)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1) translateY(0)'}
                    />
                  </div>
                  <div style={{ position:'relative', zIndex:1 }}>
                    <div style={{ fontSize:17, fontWeight:800, letterSpacing:'0.5px', marginBottom:2, color: p.c }}>{info.icon} {p.n}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', letterSpacing:1, marginBottom:8 }}>{p.t}</div>
                    <div style={{ fontSize:9, padding:'2px 10px', borderRadius:20, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.35)', letterSpacing:1, marginBottom:8, border:'1px solid rgba(255,255,255,0.08)', display:'inline-block' }}>✦ 查看详情</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.6 }}>{info.desc.substring(0, 50)}…</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ width:'100%', textAlign:'center', padding:'40px 20px', marginTop:40 }}>
          <p style={{ color:'rgba(255,255,255,0.12)', fontSize:11, letterSpacing:1 }}>UWELL FAN CLUB · 2026</p>
        </div>
      </div>

      {/* Product Modal */}
      {modalOpen && modalProduct && (
        <div onClick={() => setModalOpen(false)} style={{
          position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:200,
          background:'rgba(0,0,0,0.7)', WebkitBackdropFilter:'blur(16px)', backdropFilter:'blur(16px)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:'rgba(20,20,30,0.95)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:36,
            maxWidth:520, width:'100%', position:'relative',
          }}>
            <button onClick={() => setModalOpen(false)} style={{
              position:'absolute', top:14, right:14, width:32, height:32, borderRadius:'50%', border:'none',
              background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', fontSize:16, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>✕</button>
            <div style={{ width:'100%', height:200, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
              <img src={modalProduct.product.i} alt="" style={{ maxWidth:'90%', maxHeight:'100%', objectFit:'contain', filter:'drop-shadow(0 12px 32px rgba(0,0,0,0.5))' }} />
            </div>
            <h2 style={{ fontSize:24, fontWeight:900, letterSpacing:1, marginBottom:4, color: modalProduct.product.c }}>{modalProduct.info.icon} {modalProduct.product.n}</h2>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.25)', letterSpacing:1, marginBottom:12 }}>{modalProduct.product.t}</div>
            <div style={{ color:'rgba(255,255,255,0.45)', fontSize:13, lineHeight:1.8, marginBottom:20 }}>{modalProduct.info.desc}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {(modalProduct.info.specs || []).map((spec, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.04)', borderRadius:10, padding:'10px 14px' }}>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>{spec[0]}</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{spec[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:0.4; transform:scale(0.6) } }
        input:focus { border-color: #FFD700 !important; background: rgba(255,215,0,0.06) !important; box-shadow: 0 0 0 3px rgba(255,215,0,0.1) !important; }
        button:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,215,0,0.3); }
      `}</style>
    </div>
  );
};

export default FanEntryPage;




