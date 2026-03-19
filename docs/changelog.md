# Changelog

## [1.1.0] - 2026-03-19

### Feature
- **Atomic Credit Deduction via Supabase RPC:** Implementada lógica transacional avançada para dedução de créditos no DB visando proteger contra ataques de concorrência e race condition de multi-sessions.

### Security
- **Strict User Validation:** Removido o parâmetro `user_id` da lógica de desconto de créditos na RPC. O abatimento baseia-se exclusivamente no token criptográfico injetado via `auth.uid()`.
- **Validation Constraints:** Bloqueio nativo para deduct de montantes negativos ou nulos (`<= 0`).

### Refactor
- Refatorado `CreditService.ts` para consumir unicamente o método atômico da RPC e realizar parsing estruturado da resposta JSON no NodeJS.

---

## [1.2.0] - 2026-03-19

### Feature
- **Multi-Layer Rate Limiting (Upstash):** Novo módulo implementado previne bruteforce e abuso financeiro via APIs de IA.

### Security
- Injetado `Layer 1: IP Rate Limiter` via Next.js Edge Middleware nas rotas de /login e /signup.
- Introdução de **Structured Security Logging** preparado para Observability (Datadog/Sentry) silenciando Warnings nativos que travavam os logs tradicionais.

---

## [1.3.0] - 2026-03-19

### Feature
- **Direct-to-Storage Non-Breaking Uploads:** Desvio das cargas pesadas de Base64 para o Supabase Storage. Migração efetuada sob arquitetura "Safe Fallback" (Se o Storage cai, ele silenciosamente revigora para Base64 na UI).

### Security
- Criado Bucket `food-images` (Input Privado com RLS baseado no ID do Logista).
- Bucket `generations` atualizado de Public/Read-Only para Inteiramente Privado com requisição de URLs geradas dinamicamente com validade de 24h.
- Sanitização local de previews no DOM (`URL.createObjectURL()`) economizando dezenas de magabytes na memória RAM das abas do navegador na Studio Page.
