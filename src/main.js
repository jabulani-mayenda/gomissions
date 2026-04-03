// GO MISSIONS INTERNATIONAL — main.js

// ---- Mobile Menu ----
const hamburger = document.getElementById('hamburger');
const navbar    = document.getElementById('navbar');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navbar.classList.toggle('active');
    document.body.style.overflow = navbar.classList.contains('active') ? 'hidden' : '';
  });
}
document.querySelectorAll('.nav-link, .nav-buttons a').forEach(link => {
  link.addEventListener('click', () => {
    if (hamburger) hamburger.classList.remove('open');
    if (navbar)    navbar.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ---- Sticky Header ----
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ---- Active Nav Link on Scroll ----
const sections  = document.querySelectorAll('section[id], div[id]');
const navLinks  = document.querySelectorAll('.nav-link');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + e.target.id);
      });
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => sectionObs.observe(s));

// ---- Scroll Reveal ----
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('active');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObs.observe(el));

// ---- Flip Cards on Mobile ----
const flipCards = document.querySelectorAll('.flip-card');
const flipObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      setTimeout(() => {
        e.target.classList.add('hinted');
        setTimeout(() => e.target.classList.remove('hinted'), 1800);
      }, 300);
      flipObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
flipCards.forEach(c => flipObs.observe(c));
flipCards.forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
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

// ---- Footer Year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =========================================================
//  Supabase Config (shared between gallery + form saving)
// =========================================================
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase-config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ---- Supabase Gallery ----
async function initGallery() {
  const loadingEl = document.getElementById('gallery-loading');
  const staticEl  = document.getElementById('static-gallery');
  const gridEl    = document.getElementById('db-gallery'); // Updated to db-gallery
  const statusEl  = document.getElementById('db-status');

  // Show loading, hide others
  if (loadingEl) loadingEl.style.display  = 'block';
  if (staticEl)  staticEl.style.display   = 'none';
  if (gridEl)    gridEl.style.display     = 'none';

  try {
    const { data: snap, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    // Update status badge
    if (statusEl) {
      statusEl.className = 'db-status connected'; // Updated class name
      statusEl.innerHTML = '<span class="db-dot"></span> Gallery Connected';
    }

    if (loadingEl) loadingEl.style.display = 'none';

    if (snap && snap.length > 0 && gridEl) {
      staticEl && (staticEl.style.display = 'none');
      gridEl.style.display = 'grid';

      snap.forEach(d => {
        const dateObj = d.created_at ? new Date(d.created_at) : null;
        const date = dateObj
          ? dateObj.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
          : '';
        const card = document.createElement('div');
        card.className = 'gallery-post-card reveal-up';
        card.innerHTML = `
          ${d.image_url ? `<img src="${d.image_url}" alt="${d.caption || 'GMI'}" loading="lazy" />` : ''}
          <div class="gallery-post-body">
            ${d.verse_text ? `<p class="gallery-post-verse">${d.verse_text}</p>` : ''}
            ${d.verse_ref  ? `<div class="gallery-post-verse-ref">${d.verse_ref}</div>` : ''}
            ${d.caption   ? `<p class="gallery-post-caption">${d.caption}</p>` : ''}
            <div class="gallery-post-meta">
              <i class="ph-fill ph-calendar-blank"></i> ${date}
              ${d.posted_by ? `· <i class="ph-fill ph-user"></i> ${d.posted_by}` : ''}
            </div>
          </div>
        `;
        gridEl.appendChild(card);
        revealObs.observe(card);
      });
    } else {
      // Connected but no posts yet — show empty state inside grid area
      if (gridEl) {
        gridEl.style.display = 'block';
        gridEl.innerHTML = `
          <div class="gallery-empty">
            <i class="ph ph-images"></i>
            <h3>No posts yet</h3>
            <p>Photos and verses shared by the GFM team will appear here.</p>
          </div>
        `;
      }
      if (staticEl) staticEl.style.display = 'flex';
    }
  } catch(err) {
    console.warn('Gallery: Supabase error —', err.message);

    // Update status badge to error state
    if (statusEl) {
      statusEl.className = 'db-status disconnected'; // Updated class name
      statusEl.innerHTML = '<span class="db-dot"></span> Not Connected';
    }

    // Fall back to static gallery
    if (loadingEl) loadingEl.style.display = 'none';
    if (staticEl)  staticEl.style.display  = 'flex';
  }
}

initGallery();

// ---- Volunteer Form — save to Supabase ----
const volForm = document.getElementById('volunteer-form');
if (volForm) {
  volForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn   = document.getElementById('vol-submit');
    const name  = document.getElementById('vol-name')?.value.trim();
    const phone = document.getElementById('vol-phone')?.value.trim();
    const role  = document.getElementById('vol-role')?.value;

    if (btn) {
      btn.textContent = 'Submitting…';
      btn.disabled = true;
    }

    // try to save to Supabase
    try {
      const { error } = await supabase
        .from('volunteers')
        .insert([{ name, phone, role }]);
      if (error) throw error;
      console.info('Volunteer form saved to Supabase ✓');
    } catch(err) {
      // Silently fail — we still show the success message
      console.warn('Volunteer form could not save to Supabase:', err.message);
    }

    // Show polished success state
    const formWrap = volForm.closest('.volunteer-form');
    if (formWrap) {
      formWrap.innerHTML = `
        <div class="form-success">
          <i class="ph-fill ph-check-circle form-success-icon"></i>
          <h4>You're Signed Up!</h4>
          <p>Thank you, <strong>${name || 'friend'}</strong>! We'll be in touch soon. Welcome to the GMI family.</p>
        </div>
      `;
    }
  });
}
