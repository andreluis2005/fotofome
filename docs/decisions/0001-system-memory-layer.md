# 0001 - System Memory Layer

## Context
O ecossistema multi-agente estava sofrendo de "amnésia" arquitetural, resultando ocasionalmente em agentes sugerindo mudanças inválidas, reintroduzindo padrões já descartados no passado (como lógicas transacionais não isoladas) e gerando instabilidade sistêmica e retrabalho.

## Decision
Implementação de uma **System Memory Layer** persistente na arquitetura. Foi criado um agente dedicado designado como `MemoryGuardianAgent`. Um protocolo rígido agora exige que todos os agentes ativos consultem as decisões passadas e as restrições arquiteturais *antes* de modificar o código base. 

## Rule
1. Todo agente deve validar propostas contra as memórias (Decision Logs e System Constraints).
2. Nenhuma regra anterior deve ser revertida sem substituição oficial no Log de Decisões.
3. Nenhuma feature deve ser implementada sem refletir corretamente no sistema como um todo.

## Impacted Agents
Todos os Agentes (AIImageAgent, BackendAgent, DatabaseAgent, FrontendAgent, GrowthAgent, ProductAgent, PromptEngineerAgent, QAAgent, UXAgent, MemoryGuardianAgent).

## Status 
**ACTIVE**
