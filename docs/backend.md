# Backend Reference

## RCP: `decrement_credits`
Esta stored procedure (RPC) resolve Race Conditions no Backend no serviço de desconto de créditos. 

### Assinatura e Segurança
- **Nome:** `decrement_credits`
- **Parâmetro:** `amount` (INTEGER)
- **Segurança:** Executada no escopo do Supabase definer, mas injeta segurança pelo `auth.uid()`. O Backend **não** pode passar UUID arbitrário do usuário, bloqueando spoofing em nível de banco de dados.
- **Transação Atômica:** Utiliza `WITH updated AS (UPDATE ... RETURNING ...)` garantindo Single Statement Data Mutation.

### Retorno Esperado
JSON estruturado garantindo melhor clareza para o App Router:
```json
{
  "success": true,
  "remaining_credits": 4
}
```

## `CreditService.ts`
O módulo que encapsula interações transacionais com o Supabase SSR Client. 
Ao usar o `CreditService.consumeCredits()`, o backend joga um `throw new Error(...)` caso o banco rejeite a dedução, mantendo o controle de fluxo limpo nos controllers da API de IA (`/api/generate` etc).

## Upstash Redis (Rate Limiter)
A biblioteca `src/lib/rate-limit.ts` centraliza as lógicas das instâncias do `@upstash/ratelimit`.
O uso foi separado em dois tokens `getRateLimit('ip')` vs `getRateLimit('user')` para garantir restrições granulares. 
Todos os eventos bloqueados são exportados via o helper `logSecurityEvent` desenhado nativamente para integração com ferramentas de APM e SIEM em invés de poluir os logs padrão.

## Image Payloads (Dual-Input Compatibility)
Para garantir estabilidade durante migrações e compatibilidade com clientes desatualizados, a API de Rest do Next.js aceita polimorficamente mídias através de:
1. `image_url` (Preferencial, via Supabase Signed URL). O backend faz fetch em ArrayBuffer.
2. `imageBase64` (Legacy/Fallback). O Node converte diretamente via Regex.
