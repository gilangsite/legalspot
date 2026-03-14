/**
 * navbar.js — Shared navbar: scroll effect, active link, mobile menu
 */
(function () {
  'use strict';

  const NAVBAR_HTML = `
  <nav class="navbar" id="mainNav">
    <a href="/" class="navbar-brand">
      <img src="/assets/images/legalspot-logo.png" alt="Legalspot Logo" class="navbar-logo-img">
      <span class="navbar-brand-name">Legal<span>spot</span></span>
    </a>

    <ul class="navbar-nav">
      <li><a href="/" class="nav-link" data-page="home">Main</a></li>
      <li><a href="/product" class="nav-link" data-page="product">Service</a></li>
      <li><a href="/partner" class="nav-link" data-page="partner">Partner</a></li>
      <li><a href="/insight" class="nav-link" data-page="insight">Insight</a></li>
      <li class="nav-dropdown">
        <a class="nav-link dropdown-toggle">
          Akses
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </a>
        <div class="dropdown-menu">
          <a href="/admin/login" class="dropdown-item">Login Admin</a>
          <a href="/partner" class="dropdown-item">Partner Portal</a>
        </div>
      </li>
    </ul>

    <div class="navbar-cta">
      <a href="/partner" class="btn btn-outline btn-sm">Partner</a>
      <a href="/product" class="btn btn-primary btn-sm">
        <svg class="btn-icon" viewBox="0 0 24 24" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        Service
      </a>
    </div>

    <button class="navbar-toggle" id="navToggle" aria-label="Toggle menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
  </nav>

  <div class="navbar-mobile" id="navMobile">
    <a href="/" class="nav-link" data-page="home">Main</a>
    <a href="/product" class="nav-link" data-page="product">Service</a>
    <a href="/partner" class="nav-link" data-page="partner">Partner</a>
    <a href="/insight" class="nav-link" data-page="insight">Insight</a>
    <hr style="border:none; border-top:1px solid rgba(255,255,255,0.05); margin:0.5rem 0;">
    <a href="/admin/login" class="nav-link">Login Admin</a>
    <a href="/partner" class="btn btn-outline">Partner</a>
    <a href="/product" class="btn btn-primary">Service</a>
  </div>
  `;

  const FOOTER_HTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="navbar-brand" style="margin-bottom:0.75rem; display:inline-flex;">
            <img src="/assets/images/legalspot-logo.png" alt="Legalspot Logo" style="width: 32px; height: 32px; object-fit: contain;">
            <span class="navbar-brand-name" style="margin-left:0.5rem;">Legal<span>spot</span></span>
          </a>
          <p>Layanan perpajakan digital untuk individu dan pelaku usaha. Di bawah naungan PT Integrasia Solusi Nusantara.</p>
          <div style="margin-top:1rem;">
            <div class="footer-contact-item">
              <svg viewBox="0 0 24 24" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              +62 878-9326-8929
            </div>
            <div class="footer-contact-item">
              <svg viewBox="0 0 24 24" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              admin@legalspot.id
            </div>
          </div>
        </div>

        <div>
          <h4 class="footer-col-title">Service</h4>
          <ul class="footer-links">
            <li><a href="/product">Konsultasi Pajak</a></li>
            <li><a href="/product">Pelaporan SPT</a></li>
            <li><a href="/product">Pendampingan Coretax</a></li>
            <li><a href="/product">Semua Layanan</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-col-title">Company</h4>
          <ul class="footer-links">
            <li><a href="/#about">Tentang Kami</a></li>
            <li><a href="/#vision">Visi &amp; Misi</a></li>
            <li><a href="/partner">Program Kemitraan</a></li>
            <li><a href="/insight">Tax Insight</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-col-title">Legal</h4>
          <ul class="footer-links">
            <li><a href="#">Kebijakan Privasi</a></li>
            <li><a href="#">Syarat &amp; Ketentuan</a></li>
            <li><a href="#">Disclaimer</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2025 Legalspot &mdash; PT Integrasia Solusi Nusantara. Hak Cipta Dilindungi.</p>
        <div class="footer-legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </div>
  </footer>
  `;

  function initNavbar() {
    // Inject navbar at top of body
    const wrapper = document.createElement('div');
    wrapper.innerHTML = NAVBAR_HTML;
    document.body.prepend(wrapper);

    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('navToggle');
    const mobile = document.getElementById('navMobile');

    // Scroll effect
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
    if (window.scrollY > 20) nav.classList.add('scrolled');

    // Mobile toggle
    toggle.addEventListener('click', () => {
      mobile.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !mobile.contains(e.target)) {
        mobile.classList.remove('open');
        toggle.classList.remove('open');
      }
    });

    // Active link
    const page = document.body.dataset.page;
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      if (link.dataset.page === page) link.classList.add('active');
    });
  }

  function initFooter() {
    const footerWrapper = document.createElement('div');
    footerWrapper.innerHTML = FOOTER_HTML;
    document.body.appendChild(footerWrapper);
  }

  function showToast(message, type = 'info', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Expose globally
  window.lsNavbar = { initNavbar, initFooter, showToast };

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initFooter();
  });
})();
