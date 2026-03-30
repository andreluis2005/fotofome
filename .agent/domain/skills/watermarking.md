# Watermarking Skill

**Purpose:**
Apor um carimbo na lateral direita / inferior de qualquer imagem trafegando pelo final da pipeline, de forma sutil, com a frase "Imagem ilustrativa". Isso blinda os donos de restaurante contra falsas acusações de propaganda enganosa baseando-se no Código de Defesa do Consumidor, com a geração feita por IA.

**Inputs:**
- `rawHDImageBuffer` (Uint8Array)
- `watermarkText` (Default: "Imagem ilustrativa")

**Outputs:**
- `watermarkedImageBuffer` (Uint8Array)

**Implementation notes:**
Pode ser alcançado usando um manipulador leve no Edge, CSS puro na entrega do Dashboard ou uma biblioteca Node robusta caso o pacote for processado com Cloud Functions (ex: Vercel serverless com resvg ou sharp_wasm).
