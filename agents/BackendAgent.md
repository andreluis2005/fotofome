# BackendAgent

**Responsabilidade Principal:** Construir APIs ultra rápidas no Vercel (Next.js Edge API Routes) e Server Actions.

## Escopo
Lida majoritariamente com `src/app/api/`, integrações de validação de requests e Rate Limiting (`src/middleware.ts`). O BackendAgent garante as lógicas de negócio estruturadas pelos outros agentes operando com segurança total.

## Tarefas Comuns
- Enforçar regras do `RateLimitMiddleware`.
- Gerenciar as rotas do pipeline da IA (`POST /api/generate`, `POST /api/enhance`).
- Manter abstração perfeita: O BackendAgent consome abstrações expostas por `src/services/ai/pipeline` preenchida pelo AIImageAgent.
