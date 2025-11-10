// Reveal sections on scroll
const sections = document.querySelectorAll('.fade-in');
window.addEventListener('scroll', () => {
  const triggerBottom = window.innerHeight * 0.8;
  sections.forEach(sec => {
    const boxTop = sec.getBoundingClientRect().top;
    if (boxTop < triggerBottom) sec.classList.add('visible');
  });
});
