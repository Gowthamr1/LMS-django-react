import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';
import './ReactBitsParticles.css';

const hexToRgb = (hex) => {
  const value = hex.replace(/^#/, '');
  const number = parseInt(value.length === 3 ? value.split('').map((item) => item + item).join('') : value, 16);
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
};

const vertex = `
attribute vec3 position; attribute vec4 random; attribute vec3 color;
uniform mat4 modelMatrix; uniform mat4 viewMatrix; uniform mat4 projectionMatrix;
uniform float uTime; uniform float uSpread; uniform float uBaseSize; uniform float uSizeRandomness;
varying vec4 vRandom; varying vec3 vColor;
void main() {
  vRandom = random; vColor = color;
  vec3 pos = position * uSpread; pos.z *= 10.0;
  vec4 mPos = modelMatrix * vec4(pos, 1.0); float t = uTime;
  mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
  mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
  mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
  vec4 mvPos = viewMatrix * mPos;
  gl_PointSize = uSizeRandomness == 0.0 ? uBaseSize : (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}`;

const fragment = `
precision highp float; uniform float uTime; uniform float uAlphaParticles;
varying vec4 vRandom; varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord.xy - vec2(0.5));
  if (uAlphaParticles < 0.5) { if (d > 0.5) discard; gl_FragColor = vec4(vColor + 0.2 * sin(gl_PointCoord.yxx + uTime + vRandom.y * 6.28), 1.0); }
  else { float circle = smoothstep(0.5, 0.4, d) * 0.8; gl_FragColor = vec4(vColor + 0.2 * sin(gl_PointCoord.yxx + uTime + vRandom.y * 6.28), circle); }
}`;

// React Bits OGL particles adapted so the background never blocks LMS clicks.
//
// Rendered through a portal into document.body (not wherever this component
// happens to be mounted in the page tree). This matters: `position: fixed`
// only sizes against the real viewport if none of its ancestors set
// `transform`, `perspective`, `filter`, or `contain` — several pages here
// use `perspective` for 3D card hover effects, which would otherwise trap
// the canvas inside that page's centered, narrower content column instead
// of covering the full browser width. Portaling straight to <body> removes
// it from that ancestor chain entirely, so this always fills the whole
// viewport no matter which page mounts it or what CSS that page uses.
export default function ReactBitsParticles({
  particleCount = 400, particleSpread = 9, speed = 0.1,
  particleColors = ['#5700ff', '#01daff', '#004dff'], moveParticlesOnHover = true,
  particleHoverFactor = 1, alphaParticles = false, particleBaseSize = 260,
  sizeRandomness = 1, cameraDistance = 18, disableRotation = false,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), depth: false, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);
    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);
    const mouse = { x: 0, y: 0 };
    const resize = () => { renderer.setSize(container.clientWidth, container.clientHeight); camera.perspective({ aspect: gl.canvas.width / gl.canvas.height }); };
    const onMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 - 1;
    };
    window.addEventListener('resize', resize);
    if (moveParticlesOnHover) window.addEventListener('mousemove', onMouseMove);
    resize();
    const positions = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount * 4);
    const colors = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      let x; let y; let z; let length;
      do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1; length = x * x + y * y + z * z; } while (length > 1 || length === 0);
      const radius = Math.cbrt(Math.random());
      positions.set([x * radius, y * radius, z * radius], index * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], index * 4);
      colors.set(hexToRgb(particleColors[index % particleColors.length]), index * 3);
    }
    const geometry = new Geometry(gl, { position: { size: 3, data: positions }, random: { size: 4, data: randoms }, color: { size: 3, data: colors } });
    const program = new Program(gl, { vertex, fragment, transparent: true, depthTest: false, uniforms: {
      uTime: { value: 0 }, uSpread: { value: particleSpread }, uBaseSize: { value: particleBaseSize * Math.min(window.devicePixelRatio || 1, 2) }, uSizeRandomness: { value: sizeRandomness }, uAlphaParticles: { value: alphaParticles ? 1 : 0 },
    } });
    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    let frame; let previous = performance.now(); let elapsed = 0;
    const update = (time) => {
      frame = requestAnimationFrame(update); elapsed += (time - previous) * speed; previous = time;
      program.uniforms.uTime.value = elapsed * 0.001;
      particles.position.x = moveParticlesOnHover ? -mouse.x * particleHoverFactor : 0;
      particles.position.y = moveParticlesOnHover ? -mouse.y * particleHoverFactor : 0;
      if (!disableRotation) { particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1; particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15; particles.rotation.z += 0.01 * speed; }
      renderer.render({ scene: particles, camera });
    };
    frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      // Explicitly release the WebGL context on cleanup. Browsers cap the
      // number of live WebGL contexts (commonly ~8-16); without this,
      // fast navigation between pages that each mount this component can
      // leak contexts until the browser force-drops old ones.
      const loseContextExt = gl.getExtension('WEBGL_lose_context');
      if (loseContextExt) loseContextExt.loseContext();
    };
  }, [particleCount, particleSpread, speed, particleColors, moveParticlesOnHover, particleHoverFactor, alphaParticles, particleBaseSize, sizeRandomness, cameraDistance, disableRotation]);

  return createPortal(
    <div ref={containerRef} className="react-bits-particles" aria-hidden="true" />,
    document.body,
  );
}