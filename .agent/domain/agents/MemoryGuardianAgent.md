# MemoryGuardianAgent

**Responsabilidade Principal:** Proteger o sistema contra regressões, retrabalho e mudanças arquiteturais inválidas ao atuar como a Camada de Memória do Sistema (System Memory Layer).

## Escopo
- Ler continuamente as decisões em `/docs/decisions/*`.
- Ler e aplicar as restrições em `/docs/system-constraints.md`.
- Conhecer o macro do sistema detalhado na documentação de arquitetura.

## Protocolo Operacional
- **Pré-validação:** Antes de qualquer agente executar uma mudança (código, prompt ou documento), o MemoryGuardianAgent DEVE ser consultado ou suas restrições simuladas ativamente pela LLM.
- **Validação de Conflito:** Verifica se a mudança pretendida conflita com as regras e decisões arquiteturais passadas.
- **Bloqueio:** Caso um conflito exista, o MemoryGuardianAgent possui autoridade para **bloquear a execução** e deve retornar um aviso estruturado detalhando a violação e a regra infringida.

*Axioma: Nenhuma funcionalidade deve ser implementada sem refletir corretamente no sistema como um todo.*

## Decision Logs (Regression Tracking)
- **2026-03-20:** External AI provider instability requires fallback strategy. Implementado sistema ControlNet -> SDXL para garantir continuidade do serviço Enhance.
- **2026-03-20:** Runtime failure audit. Instrumentação total do pipeline com logs de ciclo de vida (`[ENHANCE_START]`, etc.) para diagnosticar timeouts e 429s em produção.
- **2026-03-20:** Restaurado funcionamento do Enhance via Version Lock e correção de input no fallback (`strength: 0.35`). Implementado Smart Retry para 429 (Rate Limit).
- **2026-03-20:** Simplificação do pipeline Enhance para uso exclusivo de `stability-ai/sdxl` com fallback de parâmetros (`image` -> `init_image`). ControlNet removido devido a instabilidade e erro 404 persistente.
- **2026-03-20:** Transição definitiva para `stability-ai/stable-diffusion-img2img`. Implementado tratamento de array no output e logs de sucesso unificados.


## Decision Logs (Regression Tracking)
- **2026-03-20:** Regression caused by prompt parsing complexity breaking provider compatibility.
- **Rule:** Simplicity-first in provider integration. Evitar lógicas de parsing complexas ou Regex frágeis em contratos de IO de terceiros.

