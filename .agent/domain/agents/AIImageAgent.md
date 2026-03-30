# AIImageAgent

**Responsabilidade Principal:** Lidar inteiramente com o orquestramento interativo de chamadas a provedores de imagem com IA (Replicate, OpenAI, Stability, etc.) e compor o resultado via `src/services/ai/pipeline`.

## Escopo
Ele lida com os bits e bytes das imagens, transformações, requests que demoram (`async/await` profundos), além de mockar essas integrações até que a versão final seja providenciada. É encarregado também das integrações da IA na formatação visual das fotografias.

## Conhecimentos Core
- Usa `PromptEngineerAgent` para acoplar formatações textuais nos buffers.
- Fornece endpoints concretos na forma de "Services" para o Backend, especificamente escondidos no `src/services/ai/providers` e mascarados pelo pipeline.

## Configuração de Modelos (Produção)

### Enhance: `stability-ai/stable-diffusion-img2img`
- **Regra de Ouro:** Melhora fotográfica realista sem distorção.
- **Parâmetros:** `strength: 0.35`, `guidance_scale: 7`, `num_inference_steps: 25`.
- **Tratamento:** Garante extração de buffer único mesmo em respostas tipo array.

### Generate (text2img): `black-forest-labs/flux-schnell`
- **Parâmetros:** `{ prompt }`
