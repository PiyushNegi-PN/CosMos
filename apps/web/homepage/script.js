import * as THREE from 'three';
import './errorHandler.js';

// ================================
// TOP NAVBAR & SCROLL EFFECTS
// ================================
// Navigation is now handled by nav.js for global consistency

// ================================
// INTERSECTION OBSERVER (SCROLL ANIMATIONS)
// ================================
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});

// ================================
// SOLAR SYSTEM HERO EMBED
// ================================
// The solar system is now natively embedded in the Hero Section via an iframe (main.html).
// Old Canvas placeholder and overlay popup logic has been removed to maximize performance.

// ================================
// MINI PLANET SLIDER (fixed + textured + visible)
// ================================
const miniCanvases = document.querySelectorAll(".mini-canvas");
const loader = new THREE.TextureLoader();

const planetTextures = {
  mercury: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/mercurymap.jpg',
  venus: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/venusmap.jpg',
  earth: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/earthmap1k.jpg',
  mars: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/marsmap1k.jpg',
  jupiter: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/jupitermap.jpg',
  saturn: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnmap.jpg',
  uranus: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/uranusmap.jpg',
  neptune: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/neptunemap.jpg'
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

    window.location.href = '../index.html';
  });
}