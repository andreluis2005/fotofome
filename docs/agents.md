# Multi-Agent Design

O FotoFome AI abraça o desenvolvimento autônomo. O código é particionado tanto na esfera técnica quanto na esfera lógica, dividindo tarefas em **Agentes** de desenvolvimento.

Cada agente é uma sub-entidade encarregada de gerir ou crescer partes de negócio específicas, sem interferir no código principal dos demais sem contrato prévio. Essa separação permite a um sistema de Inteligência Artificial manter e escalar o software continuamente.

## Nossos Agentes

1. **[ProductAgent](../.agent/domain/agents/ProductAgent.md)**: Responsável pelas definições de feature, precificação (Stripe/Mock) e lógica de negócio do SaaS.
2. **[FrontendAgent](../.agent/domain/agents/FrontendAgent.md)**: Constrói componentes de UI deslumbrantes, lidando com Tailwind e UX/Animações.
3. **[BackendAgent](../.agent/domain/agents/BackendAgent.md)**: Constrói APIs (Routes ou Server Actions).
4. **[AIImageAgent](../.agent/domain/agents/AIImageAgent.md)**: Encapsula todo o trabalho com APIs de difusão de imagem.
5. **[PromptEngineerAgent](../.agent/domain/agents/PromptEngineerAgent.md)**: Testa e mantém os prompts base textuais do ecossistema.
6. **[DatabaseAgent](../.agent/domain/agents/DatabaseAgent.md)**: Gerenciador de schemas, migrations, políticas de segurança e Row Level Security (RLS) do Supabase.
7. **[GrowthAgent](../.agent/domain/agents/GrowthAgent.md)**: Focado nas lógicas virais (ex: watermarks, refer links, e mecânicas gratuitas da landing page).
8. **[UXAgent](../.agent/domain/agents/UXAgent.md)**: Mapeia jornadas de usuário e define regras de interação/feedback visual antes da implementação pelo Frontend.
9. **[QAAgent](../.agent/domain/agents/QAAgent.md)**: Validador financeiro e funcional — antecipa cenários de falha, protege créditos, e exige testes E2E.
