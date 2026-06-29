import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import useLanguageStore from '../../stores/languageStore';
import useAuthStore from '../../stores/authStore';
import localDb from '../../services/db/localDb';
import seedData from '../../services/db/seedData';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { motion } from "framer-motion";
import Galaxy from "../../components/effects/Galaxy";
import ClickSpark from "../../components/effects/ClickSpark";
import Counter from "../../components/effects/Counter";
import { Spin, message } from 'antd';
import gsap from 'gsap';

// ============ Product Data (from myuwell.com CALIBURN page) ============
const PD = [
  {n:"CALIBURN AIR",c:"#ff8a2a",t:"Flagship Series",i:"https://files.myuwell.com/uwell/ow-product-color/Coral%20Orange-20260612162858842.png"},
  {n:"CALIBURN G5",c:"#00b894",t:"Flagship Series",i:"https://files.myuwell.com/uwell/ow-product-color/Mystic%20Forest-20260421153349339.png"},
  {n:"CALIBURN G5 KOKO",c:"#00cec9",t:"KOKO Series",i:"https://files.myuwell.com/uwell/ow-product-color/Ocean%20Flame-20260108144455641.png"},
  {n:"CALIBURN G5 LITE & G5 LITE SE",c:"#caff2f",t:"Lite Series",i:"https://files.myuwell.com/uwell/ow-product-color/7-20251210143156375.png"},
  {n:"G5 LITE KOKO",c:"#69f5df",t:"Lite Series",i:"https://files.myuwell.com/uwell/ow-product-color/Peacock%20Green-20251210101954130.png"},
  {n:"CALIBURN G4 PRO KOKO",c:"#d8d1bd",t:"KOKO Series",i:"https://files.myuwell.com/uwell/ow-product-color/Cosmic%20Gray-20250904100830831.png"},
  {n:"CALIBURN G4 CLASSIC",c:"#e5e5e5",t:"Classic Series",i:"https://files.myuwell.com/uwell/ow-product-color/Classic%20Silver-20250818115904349.png"},
  {n:"CALIBURN G4 PRO",c:"#4f6bff",t:"Professional Series",i:"https://files.myuwell.com/uwell/ow-product-color/Pearl%20Silver-20250626134143970.png"},
];
const PRODUCT_STRIP_ITEMS = [...PD, ...PD];
const PROD_INFO = {
  "CALIBURN AIR":{desc:"Official CALIBURN series product from myuwell.com",specs:[["Model","CALIBURN AIR"],["Series","Flagship"],["Source","myuwell.com"]],icon:"⚡"},
  "CALIBURN G5":{desc:"Official CALIBURN series product from myuwell.com",specs:[["Model","CALIBURN G5"],["Series","Flagship"],["Source","myuwell.com"]],icon:"🔥"},
  "CALIBURN G5 KOKO":{desc:"Official CALIBURN series product from myuwell.com",specs:[["Model","CALIBURN G5 KOKO"],["Series","KOKO"],["Source","myuwell.com"]],icon:"✨"},
  "CALIBURN G5 LITE & G5 LITE SE":{desc:"Official CALIBURN series product from myuwell.com",specs:[["Model","G5 Lite / G5 Lite SE"],["Series","Lite"],["Source","myuwell.com"]],icon:"✨"},
  "G5 LITE KOKO":{desc:"Official CALIBURN series product from myuwell.com",specs:[["Model","G5 Lite KOKO"],["Series","Lite KOKO"],["Source","myuwell.com"]],icon:"✨"},
  "CALIBURN G4 PRO KOKO":{desc:"Official CALIBURN series product from myuwell.com",specs:[["Model","CALIBURN G4 PRO KOKO"],["Series","KOKO"],["Source","myuwell.com"]],icon:"✨"},
  "CALIBURN G4 CLASSIC":{desc:"Official CALIBURN series product from myuwell.com",specs:[["Model","CALIBURN G4 CLASSIC"],["Series","Classic"],["Source","myuwell.com"]],icon:"🏆"},
  "CALIBURN G4 PRO":{desc:"Official CALIBURN series product from myuwell.com",specs:[["Model","CALIBURN G4 PRO"],["Series","Professional"],["Source","myuwell.com"]],icon:"🚀"},
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
  const { t } = useLanguageStore();
  const { signInLocal } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
      const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [visibleCards, setVisibleCards] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState("login");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const gridRef = useRef(null);
  const stripRef = useRef(null);
  
  // Auto-scroll product strip
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let rafId;
    let isPaused = false;
    const step = () => {
      if (!isPaused) {
        const loopWidth = strip.scrollWidth / 2;
        if (loopWidth > 0) {
          strip.scrollLeft = (strip.scrollLeft + 0.45) % loopWidth;
        }
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    const pause = () => { isPaused = true; };
    const resume = () => { isPaused = false; };
    strip.addEventListener("mouseenter", pause);
    strip.addEventListener("mouseleave", resume);
    strip.addEventListener("touchstart", pause, { passive: true });
    strip.addEventListener("touchend", resume, { passive: true });
    strip.addEventListener("focusin", pause);
    strip.addEventListener("focusout", resume);
    return () => {
      cancelAnimationFrame(rafId);
      strip.removeEventListener("mouseenter", pause);
      strip.removeEventListener("mouseleave", resume);
      strip.removeEventListener("touchstart", pause);
      strip.removeEventListener("touchend", resume);
      strip.removeEventListener("focusin", pause);
      strip.removeEventListener("focusout", resume);
    };
  }, []);

  // GSAP entrance animation for header
  useEffect(() => {
    gsap.from('.fe-hero-left h1', { opacity: 0, y: 40, duration: 1, ease: 'power3.out', delay: 0.3 });
    gsap.from('.fe-hero-left p', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', delay: 0.6 });
    gsap.from('.fe-hero-right', { opacity: 0, x: -30, duration: 0.8, ease: 'power3.out', delay: 0.9 });
  }, []);

  // Staggered product card entrance
  useEffect(() => {
    const t = setTimeout(() => setVisibleCards(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = useCallback(async () => {
    const userEmail = email || 'fan@UWELLl.com';
    try { await signInLocal(userEmail, 'fan'); } catch(e) {}
    if (localDb.needsInit()) { localDb.init(seedData); }
    let savedId = localStorage.getItem('store_manager_current_user');
    if (!savedId) {
      const fans = localDb.all('fans');
      if (fans.length > 0) {
        savedId = fans[0].id;
        localStorage.setItem('store_manager_current_user', savedId);
      }
    }
    navigate('/fan-center', { replace: true });
  }, [email, navigate, signInLocal]);

  const handleRegister = useCallback(async () => {
    if (!regName || !regEmail || !regPassword) {
      message.warning("Please fill in name, email and password");
      return;
    }
    setLoading(true);
    try {
      if (localDb.needsInit()) { localDb.init(seedData); }
      const profile = localDb.insert("profiles", { role: "fan", name: regName, phone: regPhone || "", avatar: "" });
      localDb.insert("fans", { store_id: null, user_id: profile.id, level: "bronze", points: 100, total_contribution: 0 });
      localDb.insert("auth", { id: profile.id, email: regEmail, password: regPassword, role: "fan" });
      localStorage.setItem("store_manager_current_user", profile.id);
      localStorage.setItem("fan_logged_in", "true");
      try { await signInLocal(regEmail, regPassword); } catch(e) {}
      setLoading(false);
      message.success(t('fan_entry_register_success'));
      navigate("/fan-center", { replace: true });
    } catch (err) {
      setLoading(false);
      message.error("Registration failed");
    }
  }, [regName, regEmail, regPassword, regPhone, navigate, signInLocal]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleLogin();
  }, [handleLogin]);

  const openModal = (p, info) => {
    setModalProduct({ product: p, info });
    setModalOpen(true);
  };

  return (
  <div className="fe-page">
      {/* Background layers */}
      <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:0,
        background: 'radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #14141e 60%, #000 100%)' }} />
      <AuroraCanvas />
      <ParticleCanvas />
      <MeteorShower />
      <Galaxy color="#FFD700" speed={0.15} opacity={0.2} />
      <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:3, pointerEvents:'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)' }} />

      {/* Header */}
      <header style={{
        position:'fixed', top:0, left:0, width:'100%', zIndex:50,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'14px 28px',
        background: 'linear-gradient(180deg, rgba(10,10,15,0.8) 0%, transparent 100%)',
        WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{
            fontSize:22, fontWeight:900, letterSpacing:3,
            background: 'linear-gradient(135deg, #fff 30%, #FFD700 70%, #F5A623)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>UWELL</motion.span>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#FFD700', animation:'pulse 2s ease-in-out infinite' }} />
        </div>
        <div className="fe-header-actions">
          <div className="fe-language-slot">
            <LanguageSwitcher inline={true} zIndex={360} />
          </div>
          {/* Settings */}
          <div className="fe-settings-slot">
            <button
              onClick={() => { setSettingsOpen(!settingsOpen); }}
              className={`fe-settings-trigger${settingsOpen ? " is-open" : ""}`}
              aria-label="Open settings"
            >⚙</button>
            {settingsOpen && (
              <div className="fe-settings-panel fe-settings-panel-entry">
                <div onClick={() => window.location.href='/index.html#/admin'} className="fe-settings-item">
                  <span style={{fontSize:16,width:28,textAlign:'center'}}>🔐</span> {t('settings_admin')}
                </div>
                <div className="fe-settings-divider" />
                <a href="https://www.myuwell.com" target="_blank" rel="noopener noreferrer" className="fe-settings-item">
                  <span style={{fontSize:16,width:28,textAlign:'center'}}>🌐</span> {t('settings_website')}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="fe-content-area">
        {/* Hero */}
        <div className="fe-hero-row">
          <div className="fe-hero-left">
            <div className="fe-badge">
              {t('fan_entry_tag')}
            </div>
            <motion.h1 initial={{ filter: "blur(10px)", opacity: 0, y: 20 }} animate={{ filter: "blur(0px)", opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ fontSize:52, fontWeight:900, lineHeight:1.1, letterSpacing:-2, marginBottom:16, fontFamily:"Instrument Serif, serif", fontStyle:"italic" }}>
              <span className="fe-text-gold-grad">{t("fan_entry_join")}</span><br />
              <span className="fe-text-blue-grad">{t("fan_entry_club")}</span>
            </motion.h1>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:15, lineHeight:1.7, marginBottom:28 }}>
              {t('fan_entry_desc')}
            </p>
            <div style={{ marginBottom: 20, fontSize: 14, color: '#FFD700', fontWeight: 600 }}>
              {t('fan_entry_benefits_line')}
            </div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginTop:20 }}>
              {[{label:t('fan_entry_daily_checkin'),value:1280,suffix:'+'},{label:t('fan_entry_scan_points'),value:8560,suffix:'+'},{label:t('fan_entry_rewards_mall'),value:520,suffix:'+'},{label:t('fan_entry_member_levels'),value:6,suffix:'+'}].map((f, idx) => (
                <div key={f.label} style={{ display:'flex', alignItems:'center', gap:12, fontSize:14, color:'rgba(255,255,255,0.6)', fontWeight:600, fontFamily:"Barlow, sans-serif" }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'linear-gradient(135deg,#FFD700,#F5A623)' }} />
                  <Counter from={0} to={f.value} suffix={f.suffix} duration={2} />
                </div>
              ))}
            </div>
          </div>
          <div className="fe-hero-right">
            <div className="fe-login-form fe-form-card">
              <div className="fe-form-accent" />
              <div className="fe-form-title">
                <h2 style={{ fontSize:20, fontWeight:800, letterSpacing:2, color:'#fff', marginBottom:4 }}>{mode === 'login' ? t('fan_entry_login_title') : t('fan_entry_register_title')}</h2>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:12, letterSpacing:1 }}>{mode === 'login' ? t('fan_entry_login_subtitle') : t('fan_entry_fill_fields')}</p>
              </div>
              <div className="fe-input-group">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder={t('fan_entry_placeholder_email')} autoComplete="email"
                  className="fe-input-dark"
                />
              </div>
              <div style={{ marginBottom:14 }}>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder={t('fan_entry_placeholder_password')} autoComplete="current-password"
                  className="fe-input-dark"
                />
              </div>
              <div className="fe-form-row">
                <label className="fe-form-label">
                  <input type="checkbox" defaultChecked /> {t('fan_entry_remember')}
                </label>
                <a href="#" className="fe-form-link">{t('fan_entry_forgot')}</a>
              </div>
              {mode === 'login' && (
              <button onClick={handleLogin} style={{
                width:'100%', padding:13, border:'none', borderRadius:10,
                background:'linear-gradient(135deg,#FFD700,#F5A623)',
                color:'#14141e', fontSize:14, fontWeight:700, letterSpacing:2,
                cursor:'pointer', transition:'all .3s', position:'relative', overflow:'hidden',
              }}><ClickSpark sparkColor="#FFD700" sparkSize={12} sparkRadius={20} sparkCount={12}>{t('fan_entry_signin_btn')}</ClickSpark></button>
              )}
              {mode === 'register' && (
                <>
                  <div style={{ marginBottom:10 }}>
                    <input type='text' value={regName} onChange={e => setRegName(e.target.value)} placeholder='Name *' autoComplete='name'
                      style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <input type='email' value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder='Email *' autoComplete='email'
                      style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <input type='password' value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder='Password *' autoComplete='new-password'
                      style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <input type='tel' value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder='Phone (optional)' autoComplete='tel'
                      style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' }}
                    />
                  </div>
                  <button onClick={handleRegister} disabled={loading} style={{
                    width:'100%', padding:13, border:'none', borderRadius:10,
                    background:'linear-gradient(135deg,#FFD700,#F5A623)',
                    color:'#14141e', fontSize:14, fontWeight:700, letterSpacing:2,
                    cursor: loading ? 'not-allowed' : 'pointer', transition:'all .3s', opacity: loading ? 0.6 : 1,
                  }}>{loading ? t('fan_entry_registering') : t('fan_entry_register_btn')}</button>
                  <div style={{ height:8 }} />
                </>
              )}
              {mode === 'login' ? (
                <div className="fe-form-toggle">
                  <a onClick={() => setMode('register')} className="fe-form-link">
                    {t('fan_entry_no_account')} <span className="fe-btn-secondary">{t('fan_entry_register_now')}</span>
                  </a>
                </div>
              ) : (
                <div style={{ textAlign:"center", marginTop:14 }}>
                  <a onClick={() => setMode('login')} className="fe-form-link">
                    {t('fan_entry_have_account')} <span style={{ color:'#FFD700', fontStyle:'normal', fontWeight:600 }}>{t('fan_entry_sign_in')}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      
      {/* === Caliburn Product Strip (Fixed Bottom) === */}
      <div className="fe-product-dock">
        <div ref={stripRef} className="fe-product-marquee" aria-label="CALIBURN products">
          {PRODUCT_STRIP_ITEMS.map((p, i) => (
            <div key={`${p.n}-${i}`} className="fe-product-card" onClick={() => openModal(p, PROD_INFO[p.n] || { desc: "UWELL Premium Product", icon: "✨" })}
              style={{ "--product-accent": p.c }}
              tabIndex={i < PD.length ? 0 : -1}
              aria-hidden={i >= PD.length}
              onKeyDown={e => {
                if (i < PD.length && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  openModal(p, PROD_INFO[p.n] || { desc: "UWELL Premium Product", icon: "✨" });
                }
              }}
            >
              <div className="fe-prod-img-wrap">
                <img src={p.i} alt={p.n}
                  className="fe-prod-img"
                  onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = "<div style=\"padding:20px;text-align:center;color:rgba(255,255,255,0.2);font-size:30px\">📦</div>"; }}
                />
              </div>
              <div className="fe-prod-info">
                <div className="fe-prod-name">{p.n}</div>
                <div className="fe-prod-series">{p.t}</div>
              </div>
            </div>
          ))}
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
            <div className="fe-modal-img-area">
              <img src={modalProduct.product.i} alt="" className="fe-modal-img" />
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
        button:hover { transform: translateY(-2px); }
  .liquid-glass-strong:hover { box-shadow: 0 8px 32px rgba(255,215,0,0.25) !important; border-color: rgba(255,215,0,0.4) !important; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default FanEntryPage;

