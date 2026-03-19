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
