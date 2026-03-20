# AIImageAgent

**Responsabilidade Principal:** Lidar inteiramente com o orquestramento interativo de chamadas a provedores de imagem com IA (Replicate, OpenAI, Stability, etc.) e compor o resultado via `src/services/ai/pipeline`.

## Escopo
Ele lida com os bits e bytes das imagens, transformações, requests que demoram (`async/await` profundos), além de mockar essas integrações até que a versão final seja providenciada. É encarregado também das integrações da IA na formatação visual das fotografias.

## Conhecimentos Core
- Usa `PromptEngineerAgent` para acoplar formatações textuais nos buffers.
- Fornece endpoints concretos na forma de "Services" para o Backend, especificamente escondidos no `src/services/ai/providers` e mascarados pelo pipeline.

## Configuração de Modelos (Produção)

### Enhance (ControlNet): `lucataco/sdxl-controlnet`
- **Regra de Ouro:** Fidelidade estrutural absoluta (100%).
- **Estratégia:** Usa `condition_scale: 0.95` para garantir que o prato original não seja alterado.
- **Prompt:** Carregado via SOT (`food-enhance.prompt.md`).
- **Hardware:** Nvidia L40S GPU.
- **Timeout:** 45s com retry condicional (429/503).


### Generate (text2img): `black-forest-labs/flux-schnell`
- **Parâmetros:** `{ prompt }`
