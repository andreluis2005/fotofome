# System Constraints

Este documento define as regras inquebráveis da aplicação FotoFome para o Sistema Multi-agente.

## AI Rules
- Nunca consumir créditos de usuários em caso de erro das provedoras de IA ou timeouts.
- O Agente Especializado deve aprovar a qualidade ("aspecto plastificado") antes de finalizar adequações de Enhance.

## Architecture Constraints
- **NENHUMA BREAKING CHANGE:** Não alterar os contratos das interfaces de API existentes sem aprovação explícita.
- **Single Source of Truth:** Prompts devem sempre vir da raiz `/prompts/*.md`, nunca hardcoded no core.
- Fluxos transacionais financeiros (créditos) devem ser atômicos no Supabase RPC, via `decrement_credits`.

## Prompt Rules
- Não utilizar negações abstratas ("DO NOT") no bloco principal de prompts; usar preferencialmente o bloco `[NEGATIVE_PROMPT]` com terminologia exata.
- Instruções devem ser baseadas no jargão óptico ou técnico real ("35mm lens", "f/2.8", "macro photography").

## Pipeline Limitations
- Timeout Vercel Strict: Toda requisição externa deve encerrar-se (com erro ou de forma assíncrona) num total de ~55s para evitar de esbarrar em timeouts agressivos de infraestrutura edge/serverless.
