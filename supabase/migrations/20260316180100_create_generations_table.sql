-- Migration 02: Tabela de histórico de gerações/melhorias de imagens IA

CREATE TABLE IF NOT EXISTS public.generations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode          TEXT NOT NULL CHECK (mode IN ('enhance', 'generate')),
  prompt        TEXT,
  input_url     TEXT,
  output_url    TEXT,
  credits_used  INTEGER NOT NULL DEFAULT 1,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comentários
COMMENT ON TABLE public.generations IS 'Histórico de todas as imagens geradas ou melhoradas pelo pipeline de IA.';
COMMENT ON COLUMN public.generations.mode IS 'Tipo de operação: enhance (melhoria de foto) ou generate (geração do zero).';
COMMENT ON COLUMN public.generations.status IS 'Estado do processamento: pending → processing → completed/failed.';

-- Habilitar Row Level Security
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário só vê suas próprias gerações
CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Índices para performance do dashboard
CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_created_at ON public.generations(created_at DESC);
