/**
 * home.js — Legalspot Home page interactions
 */
(function () {
    'use strict';

    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        document.querySelectorAll('.card, .vm-card, .feature-item, .ceo-quote-card, .about-grid > *').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
            observer.observe(el);
        });
    }

    function initButtonClicks() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'scale(0.96)';
            });
            btn.addEventListener('mouseup', () => {
                btn.style.transform = '';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initScrollAnimations();
        initButtonClicks();
    });
})();
