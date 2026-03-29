/**
 * config.js — Legalspot Frontend Configuration
 * Replace the values below with your actual deployment URLs and keys.
 * DO NOT commit real keys to a public repository.
 */

const LEGALSPOT_CONFIG = {
  // Google Apps Script Web App URL (deploy and paste here)
  GAS_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwhORH0YnH6kasw773f1AJ65iqU1-IotgTvkMfc519NI-5Z2AfmfKgqbES1zeTvxrsJLg/exec',

  // Google reCAPTCHA v3 Site Key (public key, safe for frontend)
  RECAPTCHA_SITE_KEY: 'YOUR_RECAPTCHA_SITE_KEY',

  // WhatsApp Admin number (international format, no + or spaces)
  WHATSAPP_ADMIN: '6287893268929',

  // Admin email (for display purposes only; real auth is on GAS)
  ADMIN_EMAIL: 'admin@legalspot.id',

  // Supabase (public anon key — safe for frontend)
  SUPABASE_URL: 'https://jcqbnqjtjjneyldwikua.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_aV4_-Wj-TATvRyL_cFSn6g_e35iK0ve',

  // Centralized Apps Script (One for all events)
  DEFAULT_GAS_ENDPOINT: 'https://script.google.com/macros/s/AKfycbJ-6_SUuH5gPlfLRt0hblRK2YuoP-N_TvazcRB5qva-gQryyMT-q4Wh-NVxeFyQQ7V/exec',
};
