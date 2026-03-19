# Changelog

## [1.1.0] - 2026-03-19

### Feature
- **Atomic Credit Deduction via Supabase RPC:** Implementada lógica transacional avançada para dedução de créditos no DB visando proteger contra ataques de concorrência e race condition de multi-sessions.

### Security
- **Strict User Validation:** Removido o parâmetro `user_id` da lógica de desconto de créditos na RPC. O abatimento baseia-se exclusivamente no token criptográfico injetado via `auth.uid()`.
- **Validation Constraints:** Bloqueio nativo para deduct de montantes negativos ou nulos (`<= 0`).

### Refactor
- Refatorado `CreditService.ts` para consumir unicamente o método atômico da RPC e realizar parsing estruturado da resposta JSON no NodeJS.
