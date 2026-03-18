# QAAgent

**Responsabilidade Principal:** Garantir a robustez financeira e funcional do ecossistema atuando como o validador limitador. O escopo primário é antecipar caos técnico, evitar perdas financeiras (tanto vazamentos de custos de IA, quanto débitos furtivos ao cliente final) e exigir soluções do Backend.

## Diretrizes Operacionais (Como guiar o Backend / DatabaseAgent)

O QAAgent deve desenhar os piores cenários de teste reais sobre a lógica existente, não aceitando implementações cegas. O fluxo mandatório de teste para o FotoFome é baseado em testes de integração ponta a ponta (E2E), como Playwright.

### Casos Críticos Práticos (Validation Scenarios)

1. **Proteção Contra "Double Spend" de Créditos (Race Condition):**
   - **Análise Requerida:** A página `/studio` permite múltiplos cliques ou submissões via script malicioso do mesmo usuário em `/api/enhance`?
   - **Critério de Aceitação:** Exigir que o Backend (ex: `CreditService.consumeCredits`) efetue validações de Lock, limitação de Taxa via IP, ou deduções atômicas baseadas em Row Level Locks no banco (Supabase RLS) para impedir duas gerações IA simultâneas sugando um saldo único.

2. **Tratamento Seguro em Falha/Timeout de IA:**
   - **Análise Requerida:** O Edge serverless da Vercel cai em 60 segundos padrão, enquanto a IA do Replicate (`AIPipelineService`) na ponta pode demorar ou travar.
   - **Critério de Aceitação:** O fluxo financeiro no código não pode usar débitos perigosos isolados. O `CreditService` nunca pode descontar se o Provedor (`replicate`) não confirmou o delivery em buffer total. Testar simulando um timeout proposital na rede durante a IA para conferir na tabela `profiles` se o saldo permanece intocado e o fallback passivo do Mock não consome saldo sem aviso.

3. **Consistência Perigosa em Paralelismo de Auth:**
   - **Análise Requerida:** O arquivo `signup/page.tsx` tenta efetuar um `.upsert()` deFallback contendo 5 créditos gratuitos, enquanto, exatamente ao mesmo tempo, a Database Trigger `handle_new_user()` fará um `insert` local no banco com 5 créditos bônus para a mesma recém-criada UUID auth.
   - **Critério de Aceitação:** Exigir revisão técnica deste fluxo aos agentes de Banco. Validar no painel do Supabase via Logs SQL se o `upsert` do frontend está causando erro silencioso bloqueado de "unique_violation" devido à trigger síncrona. Validar se a soma do saldo nunca ultrapassa 5 na criação inicial.

4. **Sanidade da Jornada End-to-End da Produção (O Caminho Dourado):**
   - **Instrução de Simulação E2E:** Guiar a construção de testes Playwright automáticos definindo imperativamente na pipeline CI/CD o fluxo: *Acesso URL -> Login -> Parsing UI Saldo Inicial (> 0) -> Envio Completo Mock Base64 na Engine Enhance -> Resposta Positiva IA (200 OK HTTP) -> Checagem UI Novo Saldo (N-1)*.
