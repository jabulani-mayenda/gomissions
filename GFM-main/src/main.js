// GO MISSIONS INTERNATIONAL — main.js (plain script, no build tool needed)

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
    if (e.isIntersecting && window.innerWidth < 768) {
      e.target.classList.add('hinted');
      setTimeout(() => e.target.classList.remove('hinted'), 1200);
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

// ---- Volunteer Form ----
const volForm = document.getElementById('volunteer-form');
if (volForm) {
  volForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('vol-submit');
    if (btn) {
      btn.textContent = '✓ Signed Up! We\'ll be in touch.';
      btn.disabled = true;
      btn.style.background = '#2d6a4f';
    }
  });
}

// ---- Footer Year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Firebase Gallery (using CDN, no build step) ----
async function initGallery() {
  const loadingEl = document.getElementById('gallery-loading');
  const staticEl  = document.getElementById('static-gallery');
  const gridEl    = document.getElementById('firebase-gallery');

  // Default: show static gallery, hide loading
  if (loadingEl) loadingEl.style.display = 'none';
  if (staticEl)  staticEl.style.display  = 'flex';
  if (gridEl)    gridEl.style.display    = 'none';

  try {
    // Load Firebase v10 from CDN
    const { initializeApp }    = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, collection, getDocs, orderBy, query, limit }
                               = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    // PASTE your Firebase config here:
    const firebaseConfig = {
      apiKey: "AIzaSyCD5CsofcFmcWhKfTSoiomejH6dM8_fbuE",
      authDomain: "go-missions-international.firebaseapp.com",
      projectId: "go-missions-international",
      storageBucket: "go-missions-international.firebasestorage.app",
      messagingSenderId: "251711071228",
      appId: "1:251711071228:web:ce13a353a988b11cb28879",
      measurementId: "G-2FB02YFZHN"
    };

    const app = initializeApp(firebaseConfig);
    const db  = getFirestore(app);
    const q   = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30));
    const snap = await getDocs(q);

    if (!snap.empty && gridEl) {
      loadingEl.style.display = 'none';
      staticEl.style.display  = 'none';
      gridEl.style.display    = 'grid';

      snap.forEach(doc => {
        const d    = doc.data();
        const date = d.createdAt?.toDate?.()
          ? d.createdAt.toDate().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
          : '';
        const card = document.createElement('div');
        card.className = 'gallery-post-card reveal-up';
        card.innerHTML = `
          ${d.imageUrl ? `<img src="${d.imageUrl}" alt="${d.caption || 'GMI'}" loading="lazy" />` : ''}
          <div class="gallery-post-body">
            ${d.verseText ? `<p class="gallery-post-verse">${d.verseText}</p>` : ''}
            ${d.verseRef  ? `<div class="gallery-post-verse-ref">${d.verseRef}</div>` : ''}
            ${d.caption   ? `<p class="gallery-post-caption">${d.caption}</p>` : ''}
            <div class="gallery-post-meta">
              <i class="ph-fill ph-calendar-blank"></i> ${date}
              ${d.postedBy ? `· <i class="ph-fill ph-user"></i> ${d.postedBy}` : ''}
            </div>
          </div>
        `;
        gridEl.appendChild(card);
        revealObs.observe(card);
      });
    }
  } catch(err) {
    console.info('Gallery: Firebase not configured yet or error loading posts.', err.message);
  }
}

initGallery();
