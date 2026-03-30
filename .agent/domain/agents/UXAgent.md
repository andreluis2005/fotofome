# UXAgent

**Responsabilidade Principal:** Mapear a jornada real do usuário e estipular as regras de interação e feedback visual *antes* da implementação pelo Frontend. Foco absoluto em conversão, confiança e redução de fricção.

## Diretrizes Operacionais (Como guiar o FrontendAgent)

Ao solicitar alterações de UI, o UXAgent deve exigir a substituição de fluxos amadores por padrões premium, baseando-se no estado atual da plataforma:

1. **Revisão do Fluxo de Autenticação (Login/Signup):**
   - **Problema Atual:** O app usa `alert()` nativo para sucesso/erro e `window.location.href` para redirecionamento repetino.
   - **Instrução ao Frontend:** Substituir os `alert()` por componentes de Toast modernos (ex: Sonner ou react-hot-toast) com estilo dark/glassmorphism alinhado ao tema. Utilizar `useRouter()` do `next/navigation` para transições suaves. Exigir componente visual de "Loading State" robusto durante o fetch.

2. **Área de Dropzone e Upload (`/studio`):**
   - **Problema Atual:** A área de "Arraste a foto" possui interatividade falsa, renderizando uma imagem estática mockada (`mockBeforeImg`).
   - **Instrução ao Frontend:** Implementar lógica nativa de Drag & Drop (ex: `react-dropzone`). Habilitar preview local dinâmico assim que o usuário seleciona a imagem (converte e exibe o base64 localmente) permitindo que o usuário veja o visual antes de autorizar o gasto e enviar à API `/api/enhance`.

3. **Gestão de Feedback de Créditos:**
   - **Problema Atual:** Se o usuário possui `<= 0` créditos, o botão de geração fica liberado ao clique, gasta tempo computacional e devolve um erro genérico por `alert()`.
   - **Instrução ao Frontend:** Bloquear interativamente (estado de erro visually impeditivo) o botão "Transformar Mágica" *imediatamente* se o saldo lido for zero. A copy do botão deve alternar dinamicamente para "Fazer Upgrade de Créditos" redirecionando agressivamente à página `/pricing`.

4. **Experiência de Carregamento (Loading State da IA):**
   - **Problema Atual:** Spinner rotativo estático com a frase "Injetando luz de estúdio culinário..." durante 15 a 60 segundos eleva a ansiedade e gera abandono.
   - **Instrução ao Frontend:** Evoluir o loading para um *Estado Progressivo*. Utilizar *Skeleton Loaders* pulsantes no container da imagem combinados com uma rotação de placeholders de texto engajantes ("Analisando o prato...", "Aquecendo as frigideiras...", "Ajustando o foco da lente...").
