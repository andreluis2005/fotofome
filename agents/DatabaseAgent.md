# DatabaseAgent

**Responsabilidade Principal:** Manter a consistência do `CreditService`, segurança e esquemas do Supabase.

## Escopo
Todo arquivo na pasta `src/lib/` ou as query interfaces dependem do trabalho do DatabaseAgent. Controla migrações de SQL, implementações do UUID e lida pesadamente em garantir que o consumo da IA tenha deduções atreladas pelo `CreditService.ts`.

## Foco Atual
- RLS em Supabase Storage.
- Mapear a base moca em Types/Interfaces, para garantir transição suave via Next.js.
