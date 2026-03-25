/**
 * CosMos Global Components
 * Handles dynamic injection of Navbar and Footer across all pages.
 */

const COMPONENTS = {
    navbar: `
    <nav class="top-nav" id="top-nav">
        <div class="nav-logo">CosMos</div>
        <ul class="nav-links">
            <li><a href="main.html">Home</a></li>
            <li><a href="deepspace.html">Deep Space</a></li>
            <li><a href="missions.html">Missions</a></li>
            <li><a href="hindu.html">Vedic Astro</a></li>
            <li><a href="dashboard.html">Dashboard</a></li>
            <li><a href="scale.html">Scale</a></li>
            <li><a href="#" id="logoutBtn" class="btn-logout">Logout</a></li>
        </ul>
        <div class="mobile-menu-btn" id="mobile-menu-btn">☰</div>
    </nav>
    `,
    footer: `
    <footer class="mega-footer">
        <div class="footer-content">
            <div class="footer-brand">
                <h2>CosMos</h2>
                <p>Journey through the Universe. An interactive exploration of space, time, and beyond.</p>
            </div>
            <div class="footer-links">
                <h3>Exploration</h3>
                <ul>
                    <li><a href="main.html">Home</a></li>
                    <li><a href="deepspace.html">Deep Space</a></li>
                    <li><a href="missions.html">Space Missions</a></li>
                    <li><a href="hindu.html">Vedic Astrology</a></li>
                    <li><a href="scale.html">Cosmic Scale</a></li>
                </ul>
            </div>
            <div class="footer-links">
                <h3>Frontier</h3>
                <ul>
                    <li><a href="dashboard.html">Live Dashboard</a></li>
                    <li><a href="exoplanets.html">Alien Worlds</a></li>
                    <li><a href="future.html">Future of Humanity</a></li>
                    <li><a href="jarvis.html">AI Control Room</a></li>
                    <li><a href="quiz.html">Cosmic Quiz</a></li>
                </ul>
            </div>
            <div class="footer-social">
                <h3>Connect With Us</h3>
                <div class="social-icons">
                    <a href="#"><i class="fa-brands fa-github"></i></a>
                    <a href="#"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#"><i class="fa-brands fa-discord"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>🌠 "Yatha Pinde Tatha Brahmande" — As is the atom, so is the universe. 🌠</p>
            <p style="margin-top: 10px;">&copy; 2026 CosMos Project. Built for cosmic explorers.</p>
        </div>
    </footer>
    <div id="scroll-top"><i class="fa-solid fa-arrow-up"></i></div>
    `
};

function injectComponents() {
    const navContainer = document.getElementById('nav-placeholder');
    const footerContainer = document.getElementById('footer-placeholder');

    if (navContainer) {
        navContainer.innerHTML = COMPONENTS.navbar;
    } else {
        const nav = document.createElement('div');
        nav.id = 'nav-placeholder';
        nav.innerHTML = COMPONENTS.navbar;
        document.body.prepend(nav);
    }

    if (footerContainer) {
        footerContainer.innerHTML = COMPONENTS.footer;
    } else {
        const footer = document.createElement('div');
        footer.id = 'footer-placeholder';
        footer.innerHTML = COMPONENTS.footer;
        document.body.appendChild(footer);
    }

    // Reinitalize Nav Logic
    initNavLogic();
    initScrollTop();
}

function initScrollTop() {
    const scrollTop = document.getElementById('scroll-top');
    if (!scrollTop) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTop.classList.add('visible');
        } else {
            scrollTop.classList.remove('visible');
        }
    });

    scrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initNavLogic() {
    const topNav = document.getElementById('top-nav');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!topNav) return;

    // Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            topNav.classList.add('scrolled');
        } else {
            topNav.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.innerText = navLinks.classList.contains('active') ? '✕' : '☰';
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.innerText = '☰';
            });
        });
    }

    // Highlight current page
    const currentPath = window.location.pathname.split('/').pop() || 'main.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active-link');
            link.style.color = '#fff';
            link.style.borderBottom = '2px solid var(--accent1)';
        }
    });
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectComponents);
} else {
    injectComponents();
}
