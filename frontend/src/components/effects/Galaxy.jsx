import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Mesh, Program, Sphere } from "ogl";
import "./Galaxy.css";

const VERT = `
attribute vec3 position;
attribute vec3 random;
uniform float uTime;
uniform float uSpeed;
varying float vRandom;
void main() {
  vec3 pos = position;
  float angle = uTime * uSpeed * (0.5 + random.x * 0.5);
  float radius = length(pos.xz);
  float rotation = atan(pos.z, pos.x) + angle * 0.1;
  pos.x = cos(rotation) * radius;
  pos.z = sin(rotation) * radius;
  pos.y += sin(uTime * 0.3 + random.y * 6.28) * 0.3;
  vRandom = random.z;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = (300.0 / -mvPosition.z) * (0.3 + random.z * 0.7);
  gl_Position = projectionMatrix * mvPosition;
}`;

const FRAG = `
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
varying float vRandom;
void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, d) * uOpacity * (0.3 + vRandom * 0.7);
  gl_FragColor = vec4(uColor, alpha);
}`;

export default function Galaxy({ color = "#FFD700", speed = 0.3, starCount = 2000, opacity = 0.4 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, antialias: true });
    const gl = renderer.gl;
    gl.canvas.style.position = "absolute";
    gl.canvas.style.top = "0";
    gl.canvas.style.left = "0";
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.pointerEvents = "none";
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 60 });
    camera.position.z = 8;

    const scene = new Transform();

    const geometry = new Sphere(gl, { radius: 4, widthSegments: 64, heightSegments: 48 });

    const positions = geometry.attributes.position;
    const count = positions.count;
    const random = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) random[i] = Math.random();
    geometry.addAttribute("random", { size: 3, data: random });

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uColor: { value: [212 / 255, 168 / 255, 0] },
        uOpacity: { value: opacity },
      },
      transparent: true,
      depthWrite: false,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    function resize() {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    }
    resize();
    window.addEventListener("resize", resize);

    let animId;
    const animate = (t) => {
      program.uniforms.uTime.value = t / 1000;
      renderer.render({ scene, camera });
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, [color, speed, starCount, opacity]);

  return <div ref={containerRef} className="galaxy-container" />;
}