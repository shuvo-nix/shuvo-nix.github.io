// Core loader with one retry (self-heals during deployments)
async function loadHtml(path) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(path);
      if (res.ok) return await res.text();
    } catch (e) {}
    await new Promise(function(r) { setTimeout(r, 800); });
  }
  return null;
}

function renderHtml(html) {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="page-section">' + html + '</div>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  initReveals();
}

function renderFallback() {
  const app = document.getElementById('app');
  app.innerHTML = '<div style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px"><div><h2 style="font-family:Space Grotesk,sans-serif;margin-bottom:12px">Page is loading</h2><p style="color:var(--text-dim)">The site was just updated. Please refresh once.</p><button class="btn btn-primary" style="margin-top:24px" onclick="location.reload()">Refresh</button></div></div>';
}

// Page navigation
async function navigateTo(page, skipPush) {
  const html = await loadHtml('pages/' + page + '.html');
  if (html !== null) {
    renderHtml(html);
    updateActiveNav(page);
    initPageScripts(page);
    if (!skipPush) { try { history.pushState({}, '', '#' + page); } catch (e) {} }
  } else { renderFallback(); }
}

// Blog post pages
async function openPost(slug) {
  const html = await loadHtml('posts/' + slug + '.html');
  if (html !== null) {
    renderHtml(html);
    updateActiveNav('blog');
    try { history.pushState({}, '', '#post/' + slug); } catch (e) {}
  } else { renderFallback(); }
}

// Project case study pages
async function openProject(slug) {
  const html = await loadHtml('projects/' + slug + '.html');
  if (html !== null) {
    renderHtml(html);
    updateActiveNav('portfolio');
    try { history.pushState({}, '', '#project/' + slug); } catch (e) {}
  } else { renderFallback(); }
}

function updateActiveNav(page) {
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

function initPageScripts(page) {
  try {
    if (page === 'faq') initFaq();
    if (page === 'contact') initContactForm();
    if (page === 'portfolio') initFilters();
  } catch (e) {}
}

// Theme toggle (icon only, remembers choice)
var themeToggle = document.getElementById('themeToggle');
var SUN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
var MOON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
if (themeToggle) {
  themeToggle.innerHTML = isDark() ? SUN_ICON : MOON_ICON;
  themeToggle.addEventListener('click', function() {
    if (isDark()) {
      document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('sx-theme', 'light'); } catch (e) {}
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('sx-theme', 'dark'); } catch (e) {}
    }
    themeToggle.innerHTML = isDark() ? SUN_ICON : MOON_ICON;
  });
}

// Scroll reveal animations with failsafe: never leave content hidden
function initReveals() {
  var els = document.querySelectorAll('.reveal');
  function revealAll() { els.forEach(function(el) { el.classList.add('in'); }); }
  if (!('IntersectionObserver' in window)) { revealAll(); return; }
  try {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function(el) { observer.observe(el); });
  } catch (e) { revealAll(); return; }
  setTimeout(revealAll, 1400);
}

// Mobile menu
var menuBtn = document.getElementById('menuBtn');
var mobileMenu = document.getElementById('mobileMenu');
var mobileClose = document.getElementById('mobileClose');
function closeMobileMenu() {
  if (mobileMenu) mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', function() {
    var opening = !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = opening ? 'hidden' : '';
  });
}
if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeMobileMenu();
});

// Nav shadow on scroll
window.addEventListener('scroll', function() {
  var nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
});

// FAQ accordion
function initFaq() {
  document.querySelectorAll('.faq-item').forEach(function(item) {
    item.querySelector('.faq-q').addEventListener('click', function() {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });
}

// Contact form (front-end only, wire to a form service later)
function initContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var success = document.getElementById('formSuccess');
    if (success) success.classList.add('show');
    setTimeout(function() {
      if (success) success.classList.remove('show');
      form.reset();
    }, 4000);
  });
}

// Portfolio filters
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      document.querySelectorAll('.portfolio-item').forEach(function(item) {
        item.style.display = (filter === 'all' || item.dataset.category === filter) ? 'block' : 'none';
      });
    });
  });
}

// Hash routing: supports #page, #post/slug, #project/slug + back/forward
function routeFromHash() {
  var hash = location.hash.replace('#', '');
  if (hash.indexOf('post/') === 0 && hash.length > 5) { openPost(hash.slice(5)); return; }
  if (hash.indexOf('project/') === 0 && hash.length > 8) { openProject(hash.slice(8)); return; }
  navigateTo(hash || 'home');
}
window.addEventListener('popstate', routeFromHash);
routeFromHash();
