# Multi-Agent Design

O FotoFome AI abraça o desenvolvimento autônomo. O código é particionado tanto na esfera técnica quanto na esfera lógica, dividindo tarefas em **Agentes** de desenvolvimento.

Cada agente é uma sub-entidade encarregada de gerir ou crescer partes de negócio específicas, sem interferir no código principal dos demais sem contrato prévio. Essa separação permite a um sistema de Inteligência Artificial manter e escalar o software continuamente.

## Nossos Agentes

1. **[ProductAgent](../agents/ProductAgent.md)**: Responsável pelas definições de feature, precificação (Stripe/Mock) e lógica de negócio do SaaS.
2. **[FrontendAgent](../agents/FrontendAgent.md)**: Constrói componentes de UI deslumbrantes, lidando com Tailwind e UX/Animações.
3. **[BackendAgent](../agents/BackendAgent.md)**: Constrói APIs (Routes ou Server Actions).
4. **[AIImageAgent](../agents/AIImageAgent.md)**: Encapsula todo o trabalho com APIs de difusão de imagem.
5. **[PromptEngineerAgent](../agents/PromptEngineerAgent.md)**: Testa e mantém os prompts base textuais do ecossistema.
6. **[DatabaseAgent](../agents/DatabaseAgent.md)**: Gerenciador de schemas, migrations, políticas de segurança e Row Level Security (RLS) do Supabase.
7. **[GrowthAgent](../agents/GrowthAgent.md)**: Focado nas lógicas virais (ex: watermarks, refer links, e mecânicas gratuitas da landing page).
