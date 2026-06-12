// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// Scroll-triggered animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('aos-visible'), Number(delay));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

// Scroll progress bar
const progressBar = document.getElementById('scrollProgress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progressBar.style.width = scrolled + '%';
  }, { passive: true });
}

// ── Services Carousel (auto-play, pause on hover) ──
(function () {
  const outer    = document.querySelector('.services-carousel-outer');
  const carousel = document.querySelector('.services-carousel');
  const track    = document.querySelector('.services-track');
  const prevBtn  = document.querySelector('.svc-prev');
  const nextBtn  = document.querySelector('.svc-next');
  const dotsWrap = document.getElementById('svcDots');

  if (!track || !carousel) return;

  const cards        = [...track.children];
  const GAP          = 20;
  const AUTOPLAY_MS  = 2800;   // advance every 2.8 s
  let   idx          = 0;
  let   autoTimer    = null;
  let   paused       = false;

  function getVisible() {
    return window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 4;
  }

  function getMaxIdx() {
    return Math.max(0, cards.length - getVisible());
  }

  function recalculate(animated) {
    const vis  = getVisible();
    const cardW = Math.floor((carousel.offsetWidth - GAP * (vis - 1)) / vis);
    cards.forEach(c => { c.style.width = cardW + 'px'; });
    idx = Math.min(idx, getMaxIdx());
    slide(animated);
    buildDots();
  }

  function slide(animated = true) {
    if (!animated) {
      track.style.transition = 'none';
      requestAnimationFrame(() => { track.style.transition = ''; });
    }
    const cardW = cards[0]?.offsetWidth || 0;
    track.style.transform = `translateX(-${idx * (cardW + GAP)}px)`;
    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx >= getMaxIdx();
    updateDots();
  }

  function buildDots() {
    if (!dotsWrap) return;
    const pages = getMaxIdx() + 1;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === idx ? ' active' : '');
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.addEventListener('click', () => { idx = i; slide(); stopAutoplay(); startAutoplay(); });
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  // ── Auto-play ──
  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(() => {
      if (paused) return;
      idx = idx < getMaxIdx() ? idx + 1 : 0;   // loop back to start
      slide();
    }, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  // Pause on hover
  outer?.addEventListener('mouseenter', () => { paused = true; });
  outer?.addEventListener('mouseleave', () => { paused = false; });

  // Manual nav still works
  prevBtn?.addEventListener('click', () => {
    if (idx > 0) { idx--; slide(); stopAutoplay(); startAutoplay(); }
  });
  nextBtn?.addEventListener('click', () => {
    if (idx < getMaxIdx()) { idx++; slide(); stopAutoplay(); startAutoplay(); }
  });

  window.addEventListener('resize', () => recalculate(false));
  recalculate(false);
  startAutoplay();
})();

// ── Leaflet Map ──
(function () {
  const mapEl = document.getElementById('sartaj-map');
  if (!mapEl || typeof L === 'undefined') return;

  const LAT = 13.0500, LNG = 80.0935;

  const map = L.map('sartaj-map', { scrollWheelZoom: false, zoomControl: true }).setView([LAT, LNG], 16);

  // CartoDB Voyager — clean modern tile style
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Custom blue teardrop marker
  const markerIcon = L.divIcon({
    html: `<div style="
      width:36px;height:36px;
      background:linear-gradient(135deg,#1d4ed8,#3b82f6);
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid #fff;
      box-shadow:0 4px 14px rgba(26,86,219,.55);
    "></div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 36],
    popupAnchor:[0, -40],
    className:  ''
  });

  L.marker([LAT, LNG], { icon: markerIcon })
    .addTo(map)
    .bindPopup(`
      <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:180px;padding:4px 0">
        <strong style="font-size:14px;color:#0d1a3a">Sartaj Glass Works</strong><br/>
        <span style="font-size:12px;color:#5a6a85">333V+V22, Bengaluru–Chennai Hwy<br/>Ettima Nagar, Poonamallee<br/>Chennai – 600056</span><br/><br/>
        <a href="https://maps.google.com/?q=${LAT},${LNG}" target="_blank"
           style="font-size:12px;font-weight:700;color:#1a56db;text-decoration:none;">
          Get Directions &rarr;
        </a>
      </div>
    `)
    .openPopup();
})();

// Active nav link scrollspy
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
if (sections.length && navAnchors.length) {
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(link => {
          link.classList.toggle('nav-active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => spyObserver.observe(s));
}
