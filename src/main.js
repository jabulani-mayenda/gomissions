import './style.css';

// Remove FOUC prevention
const fouc = document.getElementById('fouc-shield');
if (fouc) {
  document.documentElement.style.visibility = 'visible';
  document.documentElement.style.opacity = '1';
  fouc.remove();
}

// ---- Mobile Menu ----
const hamburger = document.getElementById('hamburger');
const navbar    = document.getElementById('navbar');

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navbar.classList.toggle('active');
});

document.querySelectorAll('.nav-link, .nav-buttons a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navbar.classList.remove('active');
  });
});

// ---- Sticky Header ----
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ---- Scroll Reveal ----
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('active');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObs.observe(el));

// ---- Flip Cards on Scroll (mobile - add flipped class) ----
const flipCards = document.querySelectorAll('.flip-card');
const flipObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      // On mobile (no hover), briefly flip and unflip to hint
      if (window.innerWidth < 768) {
        e.target.classList.add('hinted');
        setTimeout(() => e.target.classList.remove('hinted'), 1200);
      }
    }
  });
}, { threshold: 0.5 });
flipCards.forEach(c => flipObs.observe(c));

// Touch flip toggle for mobile
flipCards.forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});

// ---- Counter Animation ----
const counters = document.querySelectorAll('.counter');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const target = +e.target.dataset.target;
    let count = 0;
    const step = Math.ceil(target / 150);
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      e.target.textContent = count >= target ? target + '+' : count;
      if (count >= target) clearInterval(timer);
    }, 15);
    counterObs.unobserve(e.target);
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObs.observe(c));

// ---- Volunteer Form ----
document.getElementById('volunteer-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = '✓ Signed Up! We\'ll be in touch.';
  btn.disabled = true;
  btn.style.background = '#2d6a4f';
});

// ---- Footer Year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
