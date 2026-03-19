# 🍔 FotoFome AI

Transforme fotos comuns de comida em imagens profissionais com qualidade de restaurante usando Inteligência Artificial.

---

## 🚀 Sobre o Projeto

O **FotoFome AI** é um MicroSaaS que permite:

* 📸 Melhorar fotos reais de comida (Image-to-Image)
* ✨ Gerar imagens profissionais a partir de texto (Text-to-Image)
* 💳 Sistema de créditos para monetização
* ⚡ Processamento rápido via APIs de IA

---

## 🧠 Stack Tecnológica

* **Frontend:** Next.js 14 (App Router)
* **Backend:** API Routes (Edge Runtime)
* **Banco:** Supabase (PostgreSQL + Auth + Storage)
* **IA:** Replicate (com fallback mock)
* **Pagamentos:** Stripe (em integração)
* **Estilo:** TailwindCSS (Glassmorphism UI)

---

## ⚙️ Como rodar o projeto localmente

```bash
git clone https://github.com/andreluis2005/fotofome.git
cd fotofome
npm install
npm run dev
```

---

## 🔑 Variáveis de ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
REPLICATE_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 🗄️ Banco de Dados

O projeto utiliza Supabase com migrations versionadas:

* `profiles` → dados do usuário + créditos
* `generations` → histórico de imagens
* `credit_transactions` → auditoria financeira

---

## 🤖 Sistema de IA

Pipeline com fallback inteligente:

1. Tenta provider real (Replicate)
2. Se falhar → usa MockProvider (dev mode)

⚠️ Em produção, o fallback será removido para evitar inconsistências.

---

## 🧩 Arquitetura de Agentes

O projeto utiliza um sistema de multi-agentes:

* ProductAgent → regras de negócio
* FrontendAgent → UI/UX
* BackendAgent → APIs
* AIImageAgent → pipeline de IA
* PromptEngineerAgent → engenharia de prompts
* DatabaseAgent → banco e migrations
* UXAgent → experiência do usuário
* QAAgent → testes e validação

---

## 💰 Monetização

Modelo baseado em créditos:

* Usuário ganha créditos no cadastro
* Cada geração consome créditos
* Compra de pacotes via Stripe (em desenvolvimento)

---

## 📈 Roadmap

* [x] Sistema de créditos
* [x] Pipeline de geração de imagens
* [ ] Integração com Stripe
* [ ] Upload real de imagens
* [ ] Geração de vídeos (Instagram/TikTok)
* [ ] Criação de cardápios automáticos
* [ ] Geração de receitas com IA

---

## ⚠️ Status do Projeto

🚧 Em desenvolvimento (MVP avançado)

---

## 👨‍💻 Autor

Desenvolvido por Andre Messias
Projeto focado em MicroSaaS com IA e monetização escalável.

---
