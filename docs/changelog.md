## [1.4.3] - 2026-03-19

### Refactor
- **Calibração de Realismo (Enhance):** Ajuste de `condition_scale` (0.95 → 0.9) e `steps` (30 → 25) para eliminar aparência artificial e texturas plásticas.
- **Naturalness Prompt:** Adição de sufixo anti-artificialidade no `food-enhance.prompt.md` (SOT).
- **QA Metrics:** Nova validação de naturalidade visual no `QAAgent`.

## [1.4.2] - 2026-03-19

### Feat
- **Fidelidade Estrutural (Enhance):** Migração para `lucataco/sdxl-controlnet` com `condition_scale: 0.95` e `num_inference_steps: 30`. Garante 100% de preservação da estrutura original da comida.
- **Prompt SOT:** Implementado carregamento dinâmico de `prompts/food-enhance.prompt.md`. Prompt centralizado no markdown agora é a única fonte de verdade.
- **Timeout Provedor:** Ajustado para 45s para acomodar o processamento de alta fidelidade.

### Fix
- **Invalid Version Hash:** Removido hash de versão inexistente (`06d5ff16...`). 
- **Migração de Modelo:** Substituído `real-esrgan` por ControlNet para suporte a prompts e fidelidade.

---

## [1.4.1] - 2026-03-19

### Fix
- **Enhance Image Schema Fix:** Removidos parâmetros inválidos (`controlnet_model`, `strength`, `num_outputs`, `guidance_scale`) do provider `lucataco/sdxl-controlnet`. Substituídos pelos corretos: `negative_prompt`, `condition_scale`, `num_inference_steps`.
- **Invalid Version Hash:** Removido hash de versão inexistente (`06d5ff16...`). Modelo `lucataco/sdxl-controlnet` completamente inacessível (404/422).
- **Migração de Modelo:** Substituído `lucataco/sdxl-controlnet` por `nightmareai/real-esrgan` (upscaler neural ativo, atualizado março 2026). Params: `{ image, scale: 2, face_enhance: false }`.
- **Timeout Stability:** Timeout ajustado de 25s para 35s, seguro dentro do limite Vercel serverless (60s). Retry condicional mantido para 429/503.

### Docs
- Reativado enhance no `ai-pipeline.md` com tabela de modelos e parâmetros.
- Adicionada seção de Timeout Strategy ao `architecture.md`.
- Registrados UXAgent e QAAgent no `agents.md`.

---

## [1.4.0] - 2026-03-19

### Feature
- **Image Enhancement (img2img):** Reativação do fluxo de melhoria de fotos com custo de 2 créditos. Migrado para o modelo `lucataco/sdxl-controlnet` (Canny) para garantir estabilidade e preservação da estrutura do prato original via Signed URLs.
- **Automatic Menu Generation:** Novo endpoint `/api/menu/generate` utilizando modelo multimodal `LLaVA-13B` para criar títulos e descrições de pratos em Português.

### Security
- **Robust Credit Safety:** Injeção de verificações no `AIPipelineService` garantindo zero consumo de crédito em caso de timeout do provedor (25s) ou falhas na cadeia multimodal.
- **Controlled Prompting:** O modo "Enhance" agora utiliza prompts internos controlados para garantir estética de fotografia de estúdio comercial food-grade.

### Refactor
- Upgrade da interface `IAIProvider` para suportar entradas baseadas em URL e métodos multimodais.
- Implementação de **Exponential Backoff e Retry** (1 attempt) nas chamadas críticas de IA.

---

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
