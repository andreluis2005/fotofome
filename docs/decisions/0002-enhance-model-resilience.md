# 0002 - Enhance Model Resilience

## Context
A ferramenta fundamental "Enhance" começou a lançar erros agressivos de `404 Not Found` derivados do provider (Replicate) deletando instâncias hospedadas do ControlNet ou tornando-as offline em updates silentes. A degradação imediata de serviço quebra as transações atômicas de créditos e frustra o usuário final no `/studio`. A substituição do modelo para o genérico SDXL `img2img` foi vetada pois agride o Axioma de Fidelidade Estrutural (Structure Preservation).

## Decision
Para garantir disponibilidade sem abrir mão da precisão, a arquitetura agora obriga a implementação de um **Multi-Model Fallback System**.
Se o modelo primário configurado falhar ou estiver indisponível no provider (`404`, `503`), as chamadas desviam passivamente para alternativas de ControlNet ou para uma emulação segura e super-conservadora (`prompt_strength: 0.30`) no modelo estável e generalista da provedora (`stability-ai/sdxl`). 

## Rule
1. Contratos de API Node (`enhanceImage`) devem permanecer absolutamente imutáveis. O frontend não possui ciência da troca dinâmica.
2. Não hardcodear um único modelo primário; validar disponibilidade ou iterar sobre uma lista de modelos de fidelidade estrutural.
3. A métrica indicadora interna é via log: `[AI_FALLBACK_TRIGGERED]`.
4. Os modelos fallbacks operam obrigatoriamente com força algorítmica rebaixada (`0.30`) para preservar a fidelidade estrutural mínima.
5. **Simplicity-First:** Evitar lógicas de parsing complexas ou Regex frágeis em contratos de IO de terceiros (Provider Stability Fix).

## Impacted Agents
AIImageAgent, BackendAgent, QAAgent, UXAgent, MemoryGuardianAgent.

## Status 
**ACTIVE**
