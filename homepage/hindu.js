function createStars() {
  const starfield = document.getElementById('starfield');
  const starCount = 200;
  
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

// sections reveal on scroll
const sections = document.querySelectorAll('.fade-in');
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

sections.forEach(section => observer.observe(section));

createStars();

// parallax effect on scroll
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const nebula = document.querySelector('.nebula');
  const starsContainer = document.querySelector('.stars-container');
  
  if (nebula) {
    nebula.style.transform = `translateY(${scrolled * 0.3}px)`;
  }
  if (starsContainer) {
    starsContainer.style.transform = `translateY(${scrolled * 0.15}px)`;
  }
});

const timeCards = document.querySelectorAll('.time-card');
timeCards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  });
});

function updateKaliYugaYear() {
  const currentYear = new Date().getFullYear();
  const kaliYugaStart = -3101; // 3102 BCE
  const kaliYugaYear = currentYear - kaliYugaStart;
  
  const currentAgeSection = document.querySelector('.current-age .time-card p');
  if (currentAgeSection) {
    const updatedText = currentAgeSection.innerHTML.replace(/Year of Kali Yuga:<\/strong> \d+/, `Year of Kali Yuga:</strong> ${kaliYugaYear}`);
    currentAgeSection.innerHTML = updatedText;
  }
}

// dynamic year update
updateKaliYugaYear();


// 🌠 Lightbox effect for Hindu Universe image
const universeImg = document.querySelector('.hindu-universe img');

if (universeImg) {
  // Create lightbox elements
  const lightbox = document.createElement('div');
  lightbox.classList.add('lightbox');
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <img src="${universeImg.src}" alt="Hindu Universe" />
      <span class="close-btn">&times;</span>
    </div>
  `;
  document.body.appendChild(lightbox);

  // Open lightbox
  universeImg.addEventListener('click', () => {
    lightbox.classList.add('active');
  });

  // Close lightbox
  lightbox.querySelector('.close-btn').addEventListener('click', () => {
    lightbox.classList.remove('active');
  });

  // Close when clicking outside the image
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
    }
  });
}
