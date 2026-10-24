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
  // A second network fills the entire opening view, including behind the copy.
  const field = new THREE.Group();
  scene.add(field);
  let seed = 471;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const nodes = Array.from({ length: 110 }, () => new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 0.18 - 0.5));
  const fieldGeometry = new THREE.BufferGeometry().setFromPoints(nodes);
  field.add(new THREE.Points(fieldGeometry, new THREE.PointsMaterial({ color: 0xb9d8ff, size: 0.018, transparent: true, opacity: 0.65 })));
  const connections = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].distanceTo(nodes[j]) < 0.3) connections.push(nodes[i], nodes[j]);
    }
  }
  const fieldLines = new THREE.BufferGeometry().setFromPoints(connections);
  field.add(new THREE.LineSegments(fieldLines, new THREE.LineBasicMaterial({ color: 0x86a9d8, transparent: true, opacity: 0.19 })));
  let elapsed = 0;
  let pointerX = 0, pointerY = 0, inView = true, lost = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  let lastTime = 0;
  const render = () => renderer.render(scene, camera);
  function animate(time) {
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    elapsed += delta;
    field.rotation.z = Math.sin(elapsed * 0.12) * 0.025;
    field.position.x += (pointerX * 0.1 - field.position.x) * 0.025;
    field.position.y += (-pointerY * 0.1 - field.position.y) * 0.025;
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
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    field.scale.set(halfHeight * camera.aspect * 1.15, halfHeight * 1.15, 1);
    group.position.x = width > 600 ? halfHeight * camera.aspect * 0.46 : 0;
    group.scale.setScalar(width > 600 ? 0.95 : 0.8);
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
