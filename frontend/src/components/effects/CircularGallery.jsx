import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
import { useEffect, useRef } from "react";
import "./CircularGallery.css";

function lerp(p1, p2, t) { return p1 + (p2 - p1) * t; }

class Media {
  constructor({ geometry, gl, image, bend, textColor, borderRadius, font }) {
    this.extra = 0;
    this.image = image;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    const program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uBend;
        varying vec2 vUv;
        void main() {
          vec3 pos = position;
          float bend = uBend * pos.x * pos.x;
          pos.z += bend;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }`,
      fragment: `
        precision highp float;
        uniform vec3 uColor;
        uniform float uBorderRadius;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          vec2 d = abs(uv - 0.5) - 0.5 + uBorderRadius;
          float s = step(0.0, min(d.x, d.y));
          if (s < 0.5) discard;
          vec4 tex = texture2D(tMap, uv);
          gl_FragColor = vec4(tex.rgb, tex.a * 0.95);
        }`,
      uniforms: {
        uBend: { value: bend },
        uBorderRadius: { value: borderRadius },
        uColor: { value: [1, 1, 1] },
        tMap: { value: new Texture(gl, { image: new Image(), generateMipmaps: false }) },
      },
      transparent: true,
      depthWrite: false,
    });
    const plane = new Plane(gl, { width: 1, height: (16 / 9), widthSegments: 30 });
    this.plane = plane;
    this.mesh = new Mesh(gl, { geometry: plane, program });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { program.uniforms.tMap.value = new Texture(gl, { image: img }); };
    img.src = image;
  }
  setScale(width, total) {
    this.mesh.scale.x = width * 0.7;
    this.mesh.scale.y = width * 0.7 * (9 / 16);
  }
  setPosition(x) {
    this.mesh.position.x = x;
    this.mesh.position.y = 0;
  }
  setRotation(r) {
    this.mesh.rotation.y = r;
  }
  update(scroll, direction) {
    this.mesh.position.x += 0;
  }
  onResize({ viewport }) {
    this.setScale(viewport.width * 0.18, 1);
  }
}

class App {
  constructor(container, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase }) {
    this.container = container;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onWheel = this.onWheel.bind(this);
    this.medias = [];
    this.renderer = new Renderer({ alpha: true, antialias: true });
    const gl = this.renderer.gl;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    container.appendChild(gl.canvas);
    this.camera = new Camera(gl, { fov: 35 });
    this.camera.position.z = 3;
    this.scene = new Transform();
    this.tmpPos = { x: 0, y: 0, z: 0 };
    this.createMedias(items, { gl, bend, textColor, borderRadius, font });
    this.onResize();
    this.addEventListeners();
    this.update();
  }
  createMedias(items, opts) {
    const { gl, bend, textColor, borderRadius, font } = opts;
    items.forEach((item, i) => {
      const media = new Media({ geometry: new Plane(gl), gl, image: item.image, bend, textColor, borderRadius, font });
      const width = 1;
      media.setScale(width, items.length);
      media.setPosition(i - (items.length - 1) / 2);
      media.mesh.setParent(this.scene);
      this.medias.push(media);
    });
  }
  onWheel(e) {
    e.preventDefault();
    this.scroll.target += e.deltaY * 0.003;
  }
  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.perspective({ aspect: width / height });
    this.medias.forEach((m) => m.onResize({ viewport: { width, height } }));
  }
  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    this.medias.forEach((media, i) => {
      const base = i - (this.medias.length - 1) / 2;
      const offset = base - this.scroll.current;
      media.setPosition(offset);
    });
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    requestAnimationFrame(() => this.update());
  }
  addEventListeners() {
    window.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("resize", () => this.onResize());
  }
  destroy() {
    if (this.renderer?.gl?.canvas?.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
    window.removeEventListener("wheel", this.onWheel);
  }
}

export default function CircularGallery({ items, bend = 3, textColor = "#ffffff", borderRadius = 0.05, font = "bold 20px Inter", scrollSpeed = 2, scrollEase = 0.05 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !items?.length) return;
    const app = new App(ref.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase });
    return () => app.destroy();
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);
  return <div ref={ref} className="circular-gallery" tabIndex={0} role="region" aria-label="Product gallery" />;
}