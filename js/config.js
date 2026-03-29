/**
 * config.js — Legalspot Frontend Configuration
 * Replace the values below with your actual deployment URLs and keys.
 * DO NOT commit real keys to a public repository.
 */

const LEGALSPOT_CONFIG = {
  // Google Apps Script Web App URL (deploy and paste here)
  GAS_ENDPOINT: 'https://script.google.com/macros/s/AKfycbyNVKHpyVi-_iZ_Y_1x7a-_VLwe4tNt5IN33yXXZmUih2lRkq0O49yVPVfwU4iCSogf/exec',

  // Google reCAPTCHA v3 Site Key (public key, safe for frontend)
  RECAPTCHA_SITE_KEY: 'YOUR_RECAPTCHA_SITE_KEY',

  // WhatsApp Admin number (international format, no + or spaces)
  WHATSAPP_ADMIN: '6287893268929',

  // Admin email (for display purposes only; real auth is on GAS)
  ADMIN_EMAIL: 'admin@legalspot.id',

  // Supabase (public anon key — safe for frontend)
  SUPABASE_URL: 'https://jcqbnqjtjjneyldwikua.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcWJucWp0ampuZXlsZHdpa3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODU5MzQsImV4cCI6MjA5MDM2MTkzNH0.DXmQITKiNhkUYk09RHrpxC5kRBP8eQMHquIVk3V-2j4',

  // Centralized Apps Script (One for all events)
  DEFAULT_GAS_ENDPOINT: 'https://script.google.com/macros/s/AKfycbyNVKHpyVi-_iZ_Y_1x7a-_VLwe4tNt5IN33yXXZmUih2lRkq0O49yVPVfwU4iCSogf/exec',
};
