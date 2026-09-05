// Page router: loads files from pages/ into #app
async function navigateTo(page) {
  const app = document.getElementById('app');
  try {
    const res = await fetch('pages/' + page + '.html');
    if (!res.ok) throw new Error('not found');
    const html = await res.text();
    app.innerHTML = '<div class="page-section">' + html + '</div>';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateActiveNav(page);
    initPageScripts(page);
    initReveals();
    history.pushState({ page: page }, '', '#' + page);
  } catch (e) {
    app.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px"><div><h2 style="font-family:Space Grotesk,sans-serif;margin-bottom:12px">Page coming soon</h2><p style="color:var(--text-dim)">This section is being built. Check back shortly.</p><button class="btn btn-primary" style="margin-top:24px" onclick="navigateTo(\'home\')">Back to Home</button></div></div>';
  }
}

function updateActiveNav(page) {
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

function initPageScripts(page) {
  if (page === 'faq') initFaq();
  if (page === 'contact') initContactForm();
  if (page === 'portfolio') initFilters();
}

// Scroll reveal animations
function initReveals() {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el) { el.classList.add('in'); });
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function(el) { observer.observe(el); });
}

// Mobile menu
var menuBtn = document.getElementById('menuBtn');
var mobileMenu = document.getElementById('mobileMenu');
var mobileClose = document.getElementById('mobileClose');
function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}
menuBtn.addEventListener('click', function() {
  var opening = !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = opening ? 'hidden' : '';
});
mobileClose.addEventListener('click', closeMobileMenu);
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeMobileMenu();
});

// Nav shadow on scroll
window.addEventListener('scroll', function() {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 30);
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

// Back/forward support + initial load
window.addEventListener('popstate', function(e) {
  if (e.state && e.state.page) navigateTo(e.state.page);
});
var initialPage = location.hash.replace('#', '') || 'home';
navigateTo(initialPage);
