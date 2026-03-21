# Plano de Migração do BarberBook para Next.js + Supabase

Este documento detalha o plano arquitetural para converter os arquivos HTML estáticos ([barberbook-cliente.html](file:///d:/Projetos/sistema%20de%20agendamento/scheduling-app/archives/barberbook-cliente.html) e [barberbook-admin.html](file:///d:/Projetos/sistema%20de%20agendamento/scheduling-app/archives/barberbook-admin.html)) para um aplicativo React/Next.js (App Router), integrado ao Supabase para Autenticação (Google Login) e Banco de Dados Realtime.

## User Review Required
> [!IMPORTANT]
> - O script [supabase-setup.sql](file:///d:/Projetos/sistema%20de%20agendamento/scheduling-app/archives/supabase-setup.sql) original não cria uma tabela `admins`. O plano inclui a criação dessa tabela para gerenciar o acesso ao painel.
> - As chaves do Supabase (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) precisarão ser configuradas no seu `.env.local`.

---

## 1. Configuração do Supabase & Autenticação
**Objetivo**: Conectar o Next.js ao Supabase e configurar as variáveis de ambiente e helpers de SSR.

### [Dependências]
- Instalar `@supabase/ssr` e `@supabase/supabase-js`.

### [Arquivos Novos]
#### [NEW] `utils/supabase/client.ts`
- Cria o cliente Supabase para ser rodado no lado do navegador (Client Components).
#### [NEW] `utils/supabase/server.ts`
- Cria o cliente Supabase para buscar dados direto no servidor (Server Components).
#### [NEW] `middleware.ts`
- Middleware focado na rota `/admin`. Verifica a sessão ativa do usuário e o redireciona caso não esteja logado.

### [Banco de Dados]
- Executaremos o SQL [supabase-setup.sql](file:///d:/Projetos/sistema%20de%20agendamento/scheduling-app/archives/supabase-setup.sql) na plataforma do Supabase.
- Adicionaremos uma tabela extra: `create table admins (id uuid references auth.users not null primary key, email text);` com RLS restrito.

---

## 2. Autenticação e Modal de Login (Client)
**Objetivo**: Integrar o botão de Login Social do Google no modal existente.

#### [MODIFY] [components/ui/LoginButton.tsx](file:///d:/Projetos/sistema%20de%20agendamento/scheduling-app/components/ui/LoginButton.tsx)
- Adicionar o botão "Entrar com o Google".
- Chamar a função `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- Opcionalmente remover/manter os campos de usuário/senha dependendo da sua preferência de manter APENAS Google. (Foi solicitado "adicionar também o botão").

---

## 3. Fluxo de Agendamento do Cliente (App)
**Objetivo**: Converter o layout em passos do [barberbook-cliente.html](file:///d:/Projetos/sistema%20de%20agendamento/scheduling-app/archives/barberbook-cliente.html) num fluxo de estado React, mantendo o visual já criado em [app/page.tsx](file:///d:/Projetos/sistema%20de%20agendamento/scheduling-app/app/page.tsx).

#### [MODIFY] [app/page.tsx](file:///d:/Projetos/sistema%20de%20agendamento/scheduling-app/app/page.tsx)
- Como a página já começou a ser recriada com o layout novo, vamos injetar estados (ex: `step`, `selectedBarber`, `selectedService`, `selectedDate`).
- **Buscas no Banco**:
  - `barbers`: Buscar usando Supabase Server Client.
  - `services`: Buscar usando Supabase Server Client.
- **Client Components**: Criar componentes filhos interativos para a seleção no fluxo (Calendário, Horários).

#### [NEW] `app/api/appointments/route.ts` (Opcional - Server Action)
- Para criar o agendamento de forma robusta e segura, validando slots.

---

## 4. Dashboard Administrativo (Admin)
**Objetivo**: Criar a rota protegida e converter o [barberbook-admin.html](file:///d:/Projetos/sistema%20de%20agendamento/scheduling-app/archives/barberbook-admin.html) em componentes.

#### [NEW] `app/admin/layout.tsx`
- Layout que contém a `Sidebar` e a `Topbar` estáticas para a área do dashboard.
- Faz uma verificação final se o UID do Google existe na tabela `admins`.

#### [NEW] `app/admin/page.tsx`
- Conteúdo principal do dashboard administrativo.
- Exibição dos cards de estatísticas.
- Tabela de agendamentos (`appointments`).
- **Supabase Realtime**: Implementar um hook `useEffect` com `supabase.channel` para escutar novos agendamentos e notificações atualizando a UI em tempo real sem refresh.

---

## Verification Plan

### Testes Manuais
1. **Configuração Supabase**: O usuário informará as credenciais `.env` baseando-se no seu Dashboard do Supabase.
2. **Login Admin**: O usuário vai clicar no botão Google, autenticar e veremos se a sessão foi criada e validada.
3. **Criação de Agendamento**: Farei a simulação de um agendamento no site cliente e verificaremos se os dados caem no log do Supabase do usuário.
4. **Realtime**: Com a tela do Admin aberta, o novo agendamento deve pipocar automaticamente na tabela, alterando o total do dia.
