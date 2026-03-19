# FotoFome Security Policies

A arquitetura do FotoFome foi reforçada com garantias para a preservação tanto dos dados dos logistas/restaurantes quanto do financeiro da empresa mantenedora.

## 1. Credit Transaction Immunity (RPC)
Todo consumo lógico de Geração/Transformação é regido por uma single-SQL procedure que valida o `auth.uid()`, não recaindo na responsabilidade de input do frontend (O frontend envia NADA, os headers HTTP fornecem indiretamente o Proof-of-Ownership). O sistema veta lógicas que deixariam as colunas numéricas de créditos irem a estado negativo.

## 2. Abusive Workloads Mitigation (Layers)
Múltiplas camadas de Defesa contra Spam foram implementadas.
Se um logista se atrela a comportamentos abusivos de robôs ou extensões maliciosas, ativam-se dois tripwires em `src/lib/rate-limit.ts`:

- **Layer 1 (Middleware):** Escopo de IP. Protege Auth pages pre-carregamento.
- **Layer 2 (API User ID):** Escopo de Autenticação. Protege esgotamento dos Proxys de ML (Replicate etc). Se o usuário autenticado metralhar queries, sua identificação própria recebe Throttling isolado de 3 req/min sem paralisar o IP do restaurante (prevenindo que 5 funcionários no mesmo WiFi sejam mitigados).

As respostas são entregues uniformemente como Status HTTP **429 Too Many Requests**, devolvendo um JSON higienizado que não expõe detalhes de infraestrutura ou chaves para o atacante.
