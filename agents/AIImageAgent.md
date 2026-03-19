# AIImageAgent

**Responsabilidade Principal:** Lidar inteiramente com o orquestramento interativo de chamadas a provedores de imagem com IA (Replicate, OpenAI, Stability, etc.) e compor o resultado via `src/services/ai/pipeline`.

## Escopo
Ele lida com os bits e bytes das imagens, transformações, requests que demoram (`async/await` profundos), além de mockar essas integrações até que a versão final seja providenciada. É encarregado também das integrações da IA na formatação visual das fotografias.

## Conhecimentos Core
- Usa `PromptEngineerAgent` para acoplar formatações textuais nos buffers.
- Fornece endpoints concretos na forma de "Services" para o Backend, especificamente escondidos no `src/services/ai/providers` e mascarados pelo pipeline.

## Configuração de Modelos (Produção)

### Enhance (img2img): `lucataco/sdxl-controlnet`
- **Versão:** `06d5ff16773950ef500732890ca15eb901bc09395d985a676a6616a9eb789b7b`
- **Hardware:** Nvidia L40S GPU (~10s por predição, cold start pode chegar a ~30s)
- **Parâmetros válidos:** `image`, `prompt`, `negative_prompt`, `condition_scale` (0-1), `num_inference_steps` (1-500), `seed`
- **Parâmetros NÃO suportados:** ~~controlnet_model~~, ~~strength~~, ~~num_outputs~~, ~~guidance_scale~~
- **Timeout:** 35s com retry condicional (429/503)

### Generate (text2img): `black-forest-labs/flux-schnell`
- **Parâmetros:** `{ prompt }`
