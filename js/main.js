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

// Mobile menu
var menuBtn = document.getElementById('menuBtn');
var mobileMenu = document.getElementById('mobileMenu');
function closeMobileMenu() { mobileMenu.classList.remove('open'); }
menuBtn.addEventListener('click', function() { mobileMenu.classList.toggle('open'); });

// Nav shadow on scroll
window.addEventListener('scroll', function() {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
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
