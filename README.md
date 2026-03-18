# FotoFome AI

Um MicroSaaS projetado para revolucionar a identidade visual de restaurantes em plataformas de delivery (iFood, Rappi, Uber Eats). Permite a restaurantes realizarem uploads de fotos dos seus pratos ou descrever as refeições, e nossa IA cuida do resto: melhorando a foto existente ou gerando uma do zero hiper-realista.

## Arquitetura
O sistema utiliza as seguintes tecnologias (detalhado em `docs/architecture.md`):
- Frontend: Next.js 14 App Router, TailwindCSS e TypeScript
- Backend: API Routes / Edge do Next.js
- Database/Auth/Storage: Supabase
- Infra de IA (Pluggable): OpenAI/Replicate (preparado nativamente para lidar com múltiplos provedores)

## Como Desenvolver
Para subir localmente:

```bash
npm install
npm run dev
```

Abra em `http://localhost:3000`

## Multi-Agent System
Para garantir escalabilidade, este software está estruturado em um formato "amigo de IA". Na pasta raíz, você encontrará `agents` e `skills` documentando como contribuidores (como eu 😁) podem automatizar e crescer partes separadas dessa aplicação sem comprometer o todo.
