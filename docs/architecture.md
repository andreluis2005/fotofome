# Architecture Overview

## Sistema de Créditos (Credit System)
O sistema de créditos do FotoFome.AI é projetado para evitar falhas financeiras ou de concorrência. Todo o controle de consumo de créditos (ex: geração de imagens via IA) deve ser feito através da Função SQL `decrement_credits`. 

### Padrão Transacional (Atomic Update)
Para garantir que múltiplas requisições simultâneas não extraiam mais créditos do que o usuário possui (condição de corrida), **nunca** realizamos leitura (`SELECT`) seguida de escrita (`UPDATE`) no backend NodeJS. 

O fluxo é o seguinte:
1. Backend chama **RPC** `decrement_credits(amount)`.
2. A transação valida o usuário diretamente no nível do Postgres via `auth.uid()`.
3. O `UPDATE` aplica o decremento unicamente se o registro bater a condição lógica `credits >= amount`.
4. Uma inserção paralela em `credit_transactions` age como log perpétuo e auditável daquela dedução.
5. Um JSON de retorno (`{ success: boolean, remaining_credits: number }`) comunica à API se a transação atômica teve efeito.

## Anti-Abuse Shield (Rate Limiting)
Para evitar o consumo massivo de infraestrutura de IA e abusos via formulários (Scraping ou bruteforce), utilizamos  uma arquitetura Multi-Layer baseada em **Upstash Redis**:
- **Layer 1 (Edge Middleware):** Controla volumetria bruta de origem IP nas rotas de Autenticação (`/login`, `/signup`). Total: 5 req/min/IP.
- **Layer 2 (Backend APIs):** Em pontos com custo financeiro pesado (`/api/generate` etc), aplicamos throttling por **ID de Usuário** logado. Total: 3 req/min/User.

## AI Provider Timeout Strategy (Vercel Safe)
Todas as chamadas ao Replicate seguem uma estratégia de timeout compatível com Vercel serverless (`maxDuration: 60`):
- **Timeout por chamada:** 35s — acomoda cold starts da GPU L40S sem estourar o limite
- **Retry condicional:** 1 retry apenas para erros 429 (rate limit) e 503 (service unavailable), somente se houver orçamento de tempo restante
- **Proteção financeira:** Créditos descontados exclusivamente após confirmação de delivery do buffer pelo provider
