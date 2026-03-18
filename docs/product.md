# Product & Features Overview

O FotoFome AI é um MicroSaaS direcionado para donos de cozinhas delivery e gerentes de restaurantes. O modelo de negócios é um pacote pré-pago em vez de assinatura, refletindo o modelo de consumo da IA da maioria das empresas.

## MVP Features

1. **Authentication:** Registro por mágica / Github (Supabase).
2. **Image Upload:** Foto do prato sem graça capturada com um celular simples.
3. **Image Enhancement:** A IA corrige cor, textura e aplica os prompts fotográficos do `/prompts/food-enhance.prompt.md`.
4. **AI Text Generation:** "Hambúrguer de frango empanado, queijo farto". A IA engole esse input e gera foto utilizando `/prompts/food-generate.prompt.md`.
5. **Aviso Legal Opcional (Watermark):** Sela "Imagem Ilustrativa" discretamente na imagem perante a lei do consumidor.
6. **Sistema de Crédito Pré-Pago:** Desconta balance do `Profile` à cada render em alta resolução. O trial de 2 créditos.
7. **Páginas Chaves:** 
   - Landing (Explicar a ferramenta e CTA pra Try Free).
   - Base Dashboard e Image Studio UI com super slider de UX Before/After.

## Pricing (Roadmap)

Packages implementadas no banco:
* **Free Trial**: 2 imagens
* **Starter Pack**: 10 imagens ($x valor)
* **Growth Pack**: 30 imagens ($x valor)
* **Pro Pack**: 100 imagens ($x valor)

## Edge Features (Pós MVP)

* **Importação automática** de URLs do Ifood.
* Batches de geradores (Upload de 10 pratos de uma vez).
* Mock-up de banner promocional para Instagram automático com aquele prato cortado perfeitamente.
