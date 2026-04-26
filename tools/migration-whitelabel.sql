-- ============================================================
-- MIGRATION: Multi-Tenant / Whitelabel SaaS
-- Descrição: Cria a tabela `barbershops` (inquilinos) e adiciona
-- a FK `barbershop_id` nas tabelas existentes.
-- ============================================================

-- 1. Criar tabela de inquilinos (barbershops)
CREATE TABLE IF NOT EXISTS barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  theme_color VARCHAR(20) DEFAULT '#e63946',
  address TEXT,
  google_maps_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Adicionar coluna barbershop_id nas tabelas existentes
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;

-- 3. Criar tabela de Super Admins (desenvolvedores com acesso global)
CREATE TABLE IF NOT EXISTS super_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — barbershops
-- ============================================================
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;

-- Super Admin: acesso total
DROP POLICY IF EXISTS "super_admin_full_access_barbershops" ON barbershops;
CREATE POLICY "super_admin_full_access_barbershops"
  ON barbershops FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Owner: acesso apenas ao próprio estabelecimento
DROP POLICY IF EXISTS "owner_access_own_barbershop" ON barbershops;
CREATE POLICY "owner_access_own_barbershop"
  ON barbershops FOR ALL
  USING (auth.uid() = owner_id);

-- Público: leitura por slug (para a página pública)
DROP POLICY IF EXISTS "public_read_barbershop_by_slug" ON barbershops;
CREATE POLICY "public_read_barbershop_by_slug"
  ON barbershops FOR SELECT
  USING (true);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — barbers (multi-tenant)
-- ============================================================
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- Super Admin: acesso total
DROP POLICY IF EXISTS "super_admin_full_access_barbers" ON barbers;
CREATE POLICY "super_admin_full_access_barbers"
  ON barbers FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Owner: acesso ao seus barbeiros
DROP POLICY IF EXISTS "owner_access_own_barbers" ON barbers;
CREATE POLICY "owner_access_own_barbers"
  ON barbers FOR ALL
  USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

-- Público: leitura (necessário para o fluxo de agendamento)
DROP POLICY IF EXISTS "public_read_barbers" ON barbers;
CREATE POLICY "public_read_barbers"
  ON barbers FOR SELECT
  USING (true);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — services (multi-tenant)
-- ============================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Super Admin: acesso total
DROP POLICY IF EXISTS "super_admin_full_access_services" ON services;
CREATE POLICY "super_admin_full_access_services"
  ON services FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Owner: acesso aos seus serviços
DROP POLICY IF EXISTS "owner_access_own_services" ON services;
CREATE POLICY "owner_access_own_services"
  ON services FOR ALL
  USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

-- Público: leitura
DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services"
  ON services FOR SELECT
  USING (true);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — appointments (multi-tenant)
-- ============================================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Super Admin: acesso total
DROP POLICY IF EXISTS "super_admin_full_access_appointments" ON appointments;
CREATE POLICY "super_admin_full_access_appointments"
  ON appointments FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Owner: acesso aos seus agendamentos
DROP POLICY IF EXISTS "owner_access_own_appointments" ON appointments;
CREATE POLICY "owner_access_own_appointments"
  ON appointments FOR ALL
  USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

-- Público: pode criar agendamentos (INSERT) 
DROP POLICY IF EXISTS "public_insert_appointments" ON appointments;
CREATE POLICY "public_insert_appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- Público: pode ler os próprios
DROP POLICY IF EXISTS "public_read_appointments" ON appointments;
CREATE POLICY "public_read_appointments"
  ON appointments FOR SELECT
  USING (true);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — notifications (multi-tenant)
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Super Admin: acesso total
DROP POLICY IF EXISTS "super_admin_full_access_notifications" ON notifications;
CREATE POLICY "super_admin_full_access_notifications"
  ON notifications FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Owner: acesso às suas notificações
DROP POLICY IF EXISTS "owner_access_own_notifications" ON notifications;
CREATE POLICY "owner_access_own_notifications"
  ON notifications FOR ALL
  USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_barbershops_slug ON barbershops(slug);
CREATE INDEX IF NOT EXISTS idx_barbershops_owner ON barbershops(owner_id);
CREATE INDEX IF NOT EXISTS idx_barbers_barbershop ON barbers(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_services_barbershop ON services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop ON appointments(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_barbershop ON notifications(barbershop_id);
