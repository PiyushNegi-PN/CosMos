// ... existing functions ...
function createStars() {
  const starfield = document.getElementById('starfield');
  const starCount = 200;
  if (!starfield) return;
  
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random() * 3 + 2) + 's';
    starfield.appendChild(star);
  }
}

// 14 Lokas Data
const lokas = [
  { name: "Satya Loka", level: "Higher Realm (Brahma)", type: "upper" },
  { name: "Tapa Loka", level: "Higher Realm", type: "upper" },
  { name: "Jana Loka", level: "Higher Realm", type: "upper" },
  { name: "Mahar Loka", level: "Higher Realm", type: "upper" },
  { name: "Svar Loka", level: "Higher Realm", type: "upper" },
  { name: "Bhuvar Loka", level: "Higher Realm", type: "upper" },
  { name: "Bhur Loka", level: "Earth Plane", type: "upper" },
  { name: "Atala", level: "Lower Realm", type: "lower" },
  { name: "Vitala", level: "Lower Realm", type: "lower" },
  { name: "Sutala", level: "Lower Realm", type: "lower" },
  { name: "Talatala", level: "Lower Realm", type: "lower" },
  { name: "Mahatala", level: "Lower Realm", type: "lower" },
  { name: "Rasatala", level: "Lower Realm", type: "lower" },
  { name: "Patala", level: "Lowest Realm", type: "lower" }
];

function populateLokas() {
  const stack = document.getElementById('lokaStack');
  if (!stack) return;
  
  lokas.forEach((loka, index) => {
    const item = document.createElement('div');
    item.className = `loka-item ${loka.type}`;
    item.innerHTML = `
      <span class="loka-name">${loka.name}</span>
      <span class="loka-level">${loka.level}</span>
    `;
    item.style.animationDelay = `${index * 0.1}s`;
    stack.appendChild(item);
  });
}

function updateCosmicDashboard() {
  const currentYear = new Date().getFullYear();
  const kaliYugaStart = -3101; // 3102 BCE
  const kaliDuration = 432000;
  
  const elapsedInKali = currentYear - kaliYugaStart;
  const kaliProgress = (elapsedInKali / kaliDuration) * 100;
  
  // Dashboard Updates
  const kaliVal = document.getElementById('kaliProgressVal');
  const kaliFill = document.getElementById('kaliProgressFill');
  const ageVal = document.getElementById('cosmicAge');
  
  if (kaliVal) kaliVal.innerText = kaliProgress.toFixed(3) + "%";
  if (kaliFill) kaliFill.style.width = kaliProgress + "%";
  
  // Simulated Cosmic Age based on 1.97 billion years since current creation began
  if (ageVal) {
    const creationStart = 1972949126; // Approx years elapsed in current Kalpa
    ageVal.innerText = (creationStart / 1e9).toFixed(3) + "B yrs";
  }
}

function initVisualizations() {
  createStars();
  populateLokas();
  updateCosmicDashboard();
  
  // Add labels to Yuga Wheel
  const wheel = document.getElementById('yugaWheel');
  if (wheel) {
    const labels = [
      { name: 'Satya', angle: 72 },
      { name: 'Treta', angle: 198 },
      { name: 'Dvapara', angle: 288 },
      { name: 'Kali', angle: 342 }
    ];
    
    labels.forEach(l => {
      const span = document.createElement('span');
      span.className = 'wheel-label';
      span.innerText = l.name;
      const rad = 110;
      const x = 150 + rad * Math.cos((l.angle - 90) * Math.PI / 180);
      const y = 150 + rad * Math.sin((l.angle - 90) * Math.PI / 180);
      span.style.left = x + 'px';
      span.style.top = y + 'px';
      wheel.appendChild(span);
    });
  }
}

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(s => observer.observe(s));

// Parallax
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const nebula = document.querySelector('.nebula');
  const stars = document.querySelector('.stars-container');
  if (nebula) nebula.style.transform = `translateY(${scrolled * 0.2}px)`;
  if (stars) stars.style.transform = `translateY(${scrolled * 0.1}px)`;
});

window.onload = initVisualizations;

// Lightbox for Hindu Universe
const universeTrigger = document.querySelector('.hindu-universe');
if (universeTrigger) {
  universeTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    const img = universeTrigger.querySelector('img');
    const lb = document.createElement('div');
    lb.className = 'lightbox active';
    lb.innerHTML = `
      <div class="lightbox-content">
        <img src="${img.src}" alt="Hindu Universe">
        <span class="close-btn">&times;</span>
      </div>
    `;
    document.body.appendChild(lb);
    lb.querySelector('.close-btn').onclick = () => lb.remove();
    lb.onclick = (e) => { if(e.target === lb) lb.remove(); };
  });
}
