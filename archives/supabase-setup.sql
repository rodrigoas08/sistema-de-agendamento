-- ═══════════════════════════════════════════════
-- BARBERBOOK — Script de criação do banco
-- Cole este SQL no Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════

-- 1. BARBEIROS
create table if not exists barbers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null,
  rating      numeric(2,1) default 5.0,
  total_cuts  int default 0,
  tags        text[] default '{}',
  badge       text,
  color       text default '#0a0a0a',
  active      boolean default true,
  whatsapp    text,
  created_at  timestamptz default now()
);

-- 2. SERVIÇOS
create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  icon        text default '✂',
  duration    text not null,
  price       numeric(8,2) not null,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- 3. AGENDAMENTOS
create table if not exists appointments (
  id            uuid primary key default gen_random_uuid(),
  barber_id     uuid references barbers(id) on delete set null,
  barber_name   text,
  service_ids   uuid[],
  service_names text,
  date          date not null,
  time          text not null,
  client_name   text not null,
  client_phone  text not null,
  client_email  text,
  obs           text,
  total         numeric(8,2),
  status        text default 'pending' check (status in ('pending','confirmed','done','cancelled')),
  notified_wa   boolean default false,
  created_at    timestamptz default now()
);

-- 4. NOTIFICAÇÕES
create table if not exists notifications (
  id            uuid primary key default gen_random_uuid(),
  type          text not null,
  title         text not null,
  description   text,
  appointment_id uuid references appointments(id) on delete cascade,
  read          boolean default false,
  created_at    timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════

alter table barbers       enable row level security;
alter table services      enable row level security;
alter table appointments  enable row level security;
alter table notifications enable row level security;

-- Qualquer um pode ler barbeiros e serviços ativos (página pública)
create policy "public_read_barbers"   on barbers   for select using (active = true);
create policy "public_read_services"  on services  for select using (active = true);

-- Qualquer um pode inserir agendamento (cliente não faz login)
create policy "public_insert_appointments" on appointments for insert with check (true);

-- Admin autenticado pode fazer tudo
create policy "admin_all_barbers"       on barbers       for all using (auth.role() = 'authenticated');
create policy "admin_all_services"      on services      for all using (auth.role() = 'authenticated');
create policy "admin_all_appointments"  on appointments  for all using (auth.role() = 'authenticated');
create policy "admin_all_notifications" on notifications for all using (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════
-- DADOS INICIAIS
-- ═══════════════════════════════════════════════

insert into barbers (name, role, rating, total_cuts, tags, badge, color, whatsapp) values
  ('Diego Moura',  'Especialista em Degradê', 4.9, 312, '{"Degradê","Navalhado","Barba"}',  'TOP',  '#E63946', '5511999990001'),
  ('Rafael Costa', 'Mestre em Barba',         4.8, 198, '{"Barba","Bigode","Corte Social"}', null,   '#0a0a0a', '5511999990002'),
  ('Bruno Alves',  'Pele & Coloração',         4.7, 154, '{"Pigmentação","Hidratação","Corte"}','NOVO','#D4A017', '5511999990003');

insert into services (name, icon, duration, price) values
  ('Corte de Cabelo', '✂',  '30-45 min', 45),
  ('Barba Completa',  '🪒', '30 min',    35),
  ('Sobrancelha',     '〰', '15 min',    20),
  ('Pigmentação',     '🎨', '60-90 min', 80);

-- ═══════════════════════════════════════════════
-- REALTIME (para notificações ao vivo no admin)
-- ═══════════════════════════════════════════════
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table notifications;
