# Schema do Supabase (Database e Storage)

Esta documentação modela o banco de dados principal. Nosso backend-as-a-service primário é o **Supabase**.

## Autenticação

Usamos a camada base do Supabase Auth para registro. 

## Tabelas Base (Schemas Iniciais)

### Tabela: `users_profile`
Dados persistidos do usuário do SaaS e os créditos de sua carteira.
* `id` (uuid, primary key, relacionado com `auth.users`)
* `restaurant_name` (text, nullable)
* `credits_balance` (integer, default: 2) -> Representa nosso "Free Trial"
* `created_at` (timestamp)

### Tabela: `image_generations`
Histórico de fotos processadas do restaurante, linkadas ao usuário logado.
* `id` (uuid)
* `user_id` (uuid, foreign_key)
* `original_image_url` (text, nullable se for geração txt2img)
* `final_image_url` (text)
* `prompt_used` (text)
* `provider` (string, ex: 'replicate-stability')
* `created_at` (timestamp)

## Gestão do Storage (Buckets)

* **`user-uploads`**: Arquivos puros mandados pelos usuários. Possui RLS (Row Level Security) e time-to-live caso não avance.
* **`generated-images`**: O resultado final do app. Arquivos servidos no CDN do Supabase, com suporte pra resize dinâmico.
