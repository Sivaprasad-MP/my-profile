// Locally hosted Three.js. The portrait and CSS orb remain visible without WebGL.
const host = document.getElementById('network-scene');
const motionButton = document.getElementById('motion-toggle');
if (host) initializeNetwork().catch(() => { host.classList.remove('ready'); });
async function initializeNetwork() {
  const THREE = await import('./vendor/three.module.min.js');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true });
  if (!context) return;
  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  host.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 5.8;
  const group = new THREE.Group();
  scene.add(group);
  const geometry = new THREE.IcosahedronGeometry(1.72, 2);
  const edges = new THREE.EdgesGeometry(geometry, 1);
  const wireMaterial = new THREE.LineBasicMaterial({ color: 0x8aabd9, transparent: true, opacity: 0.24 });
  group.add(new THREE.LineSegments(edges, wireMaterial));
  const pointMaterial = new THREE.PointsMaterial({ color: 0xc6e1ff, size: 0.025, transparent: true, opacity: 0.85 });
  group.add(new THREE.Points(geometry, pointMaterial));
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x9cbee9, transparent: true, opacity: 0.23 });
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 129 }, (_, i) => {
    const angle = i / 128 * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * 2.05, Math.sin(angle) * 2.05, 0);
  }));
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.set(1.15, 0.35, -0.4);
  group.add(orbit);
  group.rotation.set(0.2, 0.35, -0.18);
  let pointerX = 0, pointerY = 0, inView = true, lost = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  let lastTime = 0;
  const render = () => renderer.render(scene, camera);
  function animate(time) {
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    group.rotation.y += delta * 0.055;
    group.rotation.x += (0.2 + pointerY * 0.16 - group.rotation.x) * 0.025;
    group.rotation.z += (-0.18 + pointerX * 0.08 - group.rotation.z) * 0.025;
    render();
  }
  function updateLoop() {
    lastTime = 0;
    renderer.setAnimationLoop(!paused && inView && !document.hidden && !lost ? animate : null);
    if (!lost) render();
    motionButton.hidden = lost;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Play animation ▷' : 'Pause animation Ⅱ';
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (!lost) render();
  }
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; updateLoop(); }).observe(host);
  host.parentElement.addEventListener('pointermove', event => {
    if (paused) return;
    const rect = host.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;
  }, { passive: true });
  host.parentElement.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  motionButton.addEventListener('click', () => { paused = !paused; updateLoop(); });
  reduced.addEventListener('change', event => { paused = event.matches; updateLoop(); });
  document.addEventListener('visibilitychange', updateLoop);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost = true; host.classList.remove('ready'); updateLoop();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false; host.classList.add('ready'); resize(); updateLoop();
  });
  resize();
  host.classList.add('ready');
  updateLoop();
}
