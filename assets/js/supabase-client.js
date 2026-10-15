/**
 * FNS - Faizan Network Solution
 * Supabase Client Configuration
 *
 * ─── SETUP INSTRUCTIONS ──────────────────────────────────────────
 * 1. Go to https://supabase.com → New Project
 * 2. Copy your Project URL and anon/public key from:
 *    Project Settings → API → Project URL & Project API Keys
 * 3. Replace the two placeholder values below
 * 4. In Supabase → SQL Editor, run the contents of:
 *    assets/data/supabase-schema.sql
 * 5. In Supabase → Authentication → Users, create one admin user:
 *    (your email + a strong password)
 * ─────────────────────────────────────────────────────────────────
 */

const FNS_SUPABASE_URL  = 'https://fazeqtbotmuxaprjpqci.supabase.co'; 
const FNS_SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhemVxdGJvdG11eGFwcmpwcWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDQ2OTYsImV4cCI6MjEwNzYyMDY5Nn0.qPjAvNgnTpRo2YPop6tV8BNslUs_rYpsDDze88kk33k'; // starts with eyJ...

// Create and export the client (available globally as window.fnsDb)
window.fnsDb = window.supabase.createClient(FNS_SUPABASE_URL, FNS_SUPABASE_KEY);
