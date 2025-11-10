// ================================
// NAVIGATION MENU
// ================================
const menuBtn = document.getElementById('menu-btn');
const navbar = document.getElementById('navbar');

menuBtn.addEventListener('click', () => {
  navbar.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && !menuBtn.contains(e.target)) {
    navbar.classList.remove('active');
  }
});

const navLinks = navbar.querySelectorAll('a');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navbar.classList.remove('active');
  });
});

// ================================
// SOLAR SYSTEM PREVIEW (small animation before full 3D)
// ================================
const previewCanvas = document.getElementById("solarPreviewCanvas");
const previewRenderer = new THREE.WebGLRenderer({ canvas: previewCanvas, antialias: true, alpha: true });
const previewScene = new THREE.Scene();
const previewCamera = new THREE.PerspectiveCamera(
  45,
  previewCanvas.clientWidth / previewCanvas.clientHeight,
  0.1,
  1000
);
previewCamera.position.z = 25;

const light = new THREE.PointLight(0xffffff, 2);
previewScene.add(light);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffcc00 })
);
previewScene.add(sun);

const planets = [];
const planetColors = [0x3399ff, 0xff9933, 0x33ff99, 0xcc33ff];
const orbitRadii = [7, 10, 13, 16];

for (let i = 0; i < 4; i++) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color: planetColors[i] })
  );
  previewScene.add(mesh);
  planets.push({ mesh, orbit: orbitRadii[i] });
}

function animatePreview() {
  requestAnimationFrame(animatePreview);
  sun.rotation.y += 0.002;

  planets.forEach((p, i) => {
    const t = Date.now() * 0.0004 * (i + 1);
    p.mesh.position.x = p.orbit * Math.cos(t);
    p.mesh.position.z = p.orbit * Math.sin(t);
    p.mesh.rotation.y += 0.01;
  });

  previewRenderer.setSize(previewCanvas.clientWidth, previewCanvas.clientHeight);
  previewRenderer.render(previewScene, previewCamera);
}
animatePreview();

// ================================
// SOLAR SYSTEM FULLSCREEN IFRAME
// ================================
const solarPreview = document.getElementById("solar-preview");
const solarIframeContainer = document.getElementById("solarIframeContainer");
const solarIframe = document.getElementById("solarIframe");
const closeBtn = document.getElementById("closeSolarIframe");

solarPreview.addEventListener("click", () => {
  solarIframe.src = "../system/solar.html";
  solarIframeContainer.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
  solarIframeContainer.style.display = "none";
  solarIframe.src = "";
});

// ================================
// MINI PLANET SLIDER (fixed + textured + visible)
// ================================
const miniCanvases = document.querySelectorAll(".mini-canvas");
const loader = new THREE.TextureLoader();

const planetTextures = {
  mercury: 'https://cdn.jsdelivr.net/gh/visualizeyourdata/planets-textures/8k_mercury.jpg',
  venus: 'https://cdn.jsdelivr.net/gh/visualizeyourdata/planets-textures/8k_venus_surface.jpg',
  earth: 'https://cdn.jsdelivr.net/gh/visualizeyourdata/planets-textures/8k_earth_daymap.jpg',
  mars: 'https://cdn.jsdelivr.net/gh/visualizeyourdata/planets-textures/8k_mars.jpg',
  jupiter: 'https://cdn.jsdelivr.net/gh/visualizeyourdata/planets-textures/8k_jupiter.jpg',
  saturn: 'https://cdn.jsdelivr.net/gh/visualizeyourdata/planets-textures/8k_saturn.jpg',
  uranus: 'https://cdn.jsdelivr.net/gh/visualizeyourdata/planets-textures/8k_uranus.jpg',
  neptune: 'https://cdn.jsdelivr.net/gh/visualizeyourdata/planets-textures/8k_neptune.jpg'
};

miniCanvases.forEach(canvas => {
  const planet = canvas.dataset.planet || 'earth';

  const width = canvas.clientWidth || 120;
  const height = canvas.clientHeight || 120;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 2.8;

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const point = new THREE.PointLight(0xffffff, 1.5);
  point.position.set(5, 3, 5);
  scene.add(ambient, point);

  // planet mesh
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    map: loader.load(planetTextures[planet], () => {
      renderer.render(scene, camera);
    })
  });

  const sphere = new THREE.Mesh(geometry, material);
  sphere.rotation.x = 0.3;
  scene.add(sphere);

  // animation loop
  function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.004;
    renderer.render(scene, camera);
  }

  // wait to ensure visibility
  setTimeout(() => animate(), 200);

  // resize handler
  new ResizeObserver(() => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w > 0 && h > 0) {
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }).observe(canvas);

  // click event → go to planet page
  canvas.addEventListener('click', () => {
    const planetPages = {
      mercury: '../system/mercury.html',
      venus: '../system/venus.html',
      earth: '../system/earth.html',
      mars: '../system/mars.html',
      jupiter: '../system/jupiter.html',
      saturn: '../system/saturn.html',
      uranus: '../system/uranus.html',
      neptune: '../system/neptune.html'
    };
    if (planetPages[planet]) window.location.href = planetPages[planet];
  });
});

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();

    localStorage.removeItem('user');
    sessionStorage.clear();

    alert('You have been logged out.');

    window.location.href = '../login.html';
  });
}