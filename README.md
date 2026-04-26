# Agenda PRO — SaaS de Agendamento (White-Label)

Plataforma Multi-Tenant desenvolvida para gerenciamento online de agendas. Clientes realizam agendamentos de forma autônoma e interagem com a interface que adota as cores (White-Label) e configurações do estabelecimento. Gestores e barbeiros controlam agenda, serviços e faturamento por um painel administrativo intuitivo.

## ✨ Características Principais

- **Arquitetura Multi-Tenant / SaaS:** Múltiplas lojas rodam na mesma base de dados. O projeto utiliza `barbershop_id` aliado ao *Row Level Security (RLS)* (Supabase) para assegurar o isolamento das informações.
- **Ecossistema White-Label:** Cada loja possui seu próprio slug (ex: `/minha-barbearia`), recebe sua respectiva identidade visual dinâmica (Cores em tempo real manipuladas pelo Tailwind v4 + CSS vars), nome e logo no Header.
- **Painel Administrativo (`/admin`):**
  - Configurações da Barbearia (White-Label)
  - Notificações de novos agendamentos via Polling / WebSockets (Supabase Subscriptions).
  - Controle de Equipe e Serviços.
  - Seletor de Tenant (Exclusivo para o *Super Admin* gerenciar todas as lojas cadastradas na plataforma).

## 🧰 Stack Tecnológica

- **Front-end:** Next.js 15 (App Router), React 19, TypeScript
- **State Management & Fetching:** TanStack React Query + Axios (Custom Hooks para chamadas e caches)
- **Design System:** Tailwind CSS v4, Radix UI (Primitivos Headless)
- **Forms & Validation:** React Hook Form + Zod
- **Backend/Auth/BD:** Supabase (PostgreSQL + RLS Policies + Storage + Auth API)

---

## 🚀 Como Rodar Localmente

**Pré-requisitos:** Node.js v20+ e [pnpm](https://pnpm.io) instalado.

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd scheduling-app
   ```

2. **Instale as dependências:**
   ```bash
   pnpm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz e preencha as chaves exportadas do seu projeto Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
   ```

4. **Inicie o ambiente de desenvolvimento:**
   ```bash
   pnpm dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000). A base da URL `/` atua como plataforma SaaS, exibindo uma vitrine de todas as barbearias.

---

## 🏗 Setup do Banco de Dados (Supabase)

Como a plataforma funciona como um SaaS multi-tenant, você precisa inicializar o SQL.
Existe um script contendo a criação das tabelas e as devidas permissões RLS.

- Execute o conteúdo de `tools/migration-whitelabel.sql` no **SQL Editor** do painel do Supabase.

---

## ⚙️ Criando uma Barbearia e um Super Admin

Para utilizar o sistema ao máximo e testar o cadastro, o fluxo manual via SQL Editor do Supabase é o seguinte:

### 1. Criar e autorizar o seu Usuário Supabase
Certifique-se de que se cadastrou através do fluxo da sua URL localhost `/login` utilizando o botão "Google" ou credenciais padrão. Copie o **UUID** (`user_id`) no painel em `Authentication > Users`. 

### 2. Cadastrar Administrador (Super Admin)
Para gerenciar *todas* as barbearias via dashboard usando o *Tenant Selector*:
```sql
INSERT INTO super_admins (user_id) 
VALUES ('COLOQUE_AQUI_SEU_USER_ID');

-- Importante: Assegure-se de também que o usuário foi inserido na tabela de `admins`:
INSERT INTO admins (id, email) 
VALUES ('COLOQUE_AQUI_SEU_USER_ID', 'seu-email@teste.com');
```

### 3. Cadastrar uma Barbearia
Para inicializar o seu acesso multi-tenant, crie uma Barbearia relacionando seu usuário como dono:
```sql
INSERT INTO barbershops (name, slug, owner_id, theme_color, address) 
VALUES (
  'Barbearia Teste', 
  'barbearia-teste', 
  'COLOQUE_AQUI_SEU_USER_ID', 
  '#dc2626', 
  'Rua Exemplo, 123'
);
```
O campo `slug` é fundamental. Se designar o slug como `barbearia-teste`, o site da unidade fica disponível e isolado em: `http://localhost:3000/barbearia-teste`.

### 4. Acessar o Dashboard
Estando autenticado, visite **http://localhost:3000/admin/dashboard**.  
Se o usuário estiver atrelado a uma barbearia pelo `owner_id`, você terá o dashboard isolado para operá-la. Caso seja um `super_admin`, você verá um Menu Dropdown (Seletor de Inquilinos) no topo que permite transitar pelos painéis de gerência das barbearias cadastradas.
