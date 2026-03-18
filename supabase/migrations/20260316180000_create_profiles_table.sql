-- Migration 01: Tabela de perfis de usuários
-- Vinculada ao auth.users do Supabase para manter 1:1

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user',
  credits       INTEGER NOT NULL DEFAULT 5,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comentário na tabela para documentação
COMMENT ON TABLE public.profiles IS 'Perfis de usuários do FotoFome. Cada registro está vinculado 1:1 com auth.users.';
COMMENT ON COLUMN public.profiles.credits IS 'Saldo de créditos para geração/melhoria de imagens IA.';

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso: cada usuário só acessa seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
