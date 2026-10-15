-- ═══════════════════════════════════════════════════════════════
-- FNS - Faizan Network Solution  |  Supabase Schema Setup
-- Run this entire file in: Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════

-- ── 1. ORDERS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id              TEXT PRIMARY KEY,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  customer_email  TEXT DEFAULT '',
  company         TEXT DEFAULT '',
  location        TEXT DEFAULT 'Dhaka, Bangladesh',
  items           JSONB NOT NULL DEFAULT '[]',
  total_items     INTEGER DEFAULT 1,
  note            TEXT DEFAULT '',
  status          TEXT DEFAULT 'Pending',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. MESSAGES TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT NOT NULL DEFAULT '',
  subject     TEXT NOT NULL DEFAULT 'Hardware Inquiry',
  message     TEXT NOT NULL,
  status      TEXT DEFAULT 'unread',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. ENABLE ROW LEVEL SECURITY ────────────────────────────────
ALTER TABLE public.orders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ── 4. RLS POLICIES: ORDERS ──────────────────────────────────────
-- Anyone (anon) can submit an order
CREATE POLICY "Public can insert orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only logged-in admin can read orders
CREATE POLICY "Admin can read orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (true);

-- Only logged-in admin can update order status
CREATE POLICY "Admin can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (true);

-- Only logged-in admin can delete orders
CREATE POLICY "Admin can delete orders"
  ON public.orders FOR DELETE
  TO authenticated
  USING (true);

-- ── 5. RLS POLICIES: MESSAGES ────────────────────────────────────
-- Anyone (anon) can submit a contact message
CREATE POLICY "Public can insert messages"
  ON public.messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only logged-in admin can read messages
CREATE POLICY "Admin can read messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (true);

-- Only logged-in admin can mark read/unread
CREATE POLICY "Admin can update messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (true);

-- Only logged-in admin can delete messages
CREATE POLICY "Admin can delete messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (true);
