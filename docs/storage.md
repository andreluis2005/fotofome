# Storage Architecture (Supabase Storage)

O FotoFome adota gestão de arquivos via Supabase Storage dividida estrategicamente para separar Origens (_Inputs_) de Resultados (_Outputs_), focando em Segurança de RLS e Economia de Custo (Bandwidth).

## Buckets

### 1. `food-images` (Private)
Este bucket hospeda todas as imagens base/cruas fornecidas por restaurantes.
- **Access Control:** Privado.
- **Inserção:** O React Dropzone do Frontend (`src/app/studio/page.tsx`) envia os dados diretamente (Bypassing Vercel Limits) usando a política RLS que fixa o path raiz como `auth.uid()`.
- **Preview:** O frontend usa `URL.createObjectURL` instantâneo em vez de ler o disco para reduzir travamentos da aba.
- **Fallback:** Se a política, rede ou upload falharem, o app aborta graciosamente o uploader remoto e fallback para conversão segura (porém pesada) em Base64 DataURI, garantindo **Non-Breaking Migration** (zero perdas de conversão do cliente).

### 2. `generations` (Private)
Hospeda as renderizações finais pós-IA (geradas do zero ou melhoradas).
- **Access Control:** Originalmente Público, migrado pra Privado a fim de prevenir Scraping Global. URLs do resultado final agora são distribuídas via _Signed URLs_ com expiração em 24h.
- **Processamento:** O Backend (`/api/generate` ou `/api/enhance`) captura os Buffers pós-processados pelo Node.js/Replicate, injeta no Bucket através da Service Role e retorna a _Signed URL_ para o Desktop/Mobile.
- **Fallback:** Caso de indisponibilidade severa no Supabase Storage durante o momento de finalização, o Node envia a imagem mastigada em Base64 para garantir a fluidez visual do usuário.
