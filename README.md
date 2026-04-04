# BarberBook — Sistema de Agendamento para Barbearias

Sistema web de agendamento online criado para organizar a agenda de barbearias de forma simples e sem burocracia. Clientes agendam pelo site em minutos; barbeiros e administradores gerenciam tudo pelo painel admin.

## O problema que resolve

Barbearias que dependem de telefone ou WhatsApp para agendar perdem clientes por demora na resposta e têm dificuldade em controlar a agenda com clareza. Este sistema permite que o cliente escolha barbeiro, serviço, data e horário de forma totalmente autônoma — e o admin confirma ou cancela pelo painel, com os horários sendo bloqueados automaticamente para novos agendamentos.

---

## Stack

- **Framework:** Next.js (App Router)
- **Banco de dados / Auth:** Supabase
- **Estilização:** Tailwind CSS
- **Deploy:** Vercel

---

## Rodando localmente

**Pré-requisito:** ter o [pnpm](https://pnpm.io) instalado.

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

> Certifique-se de configurar as variáveis de ambiente no arquivo `.env.local` com as credenciais do Supabase antes de rodar.

---

## Deploy para produção

Para fazer o deploy da branch atual direto para produção na Vercel:

```bash
npx vercel --prod
```

> É necessário estar autenticado na Vercel CLI (`npx vercel login`) antes do primeiro deploy.
