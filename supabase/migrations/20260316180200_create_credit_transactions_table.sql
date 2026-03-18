-- Migration 03: Tabela de log de transações de créditos
-- Serve como auditoria de todas as movimentações (compra, consumo, bônus, reembolso)

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL,  -- positivo = adição, negativo = consumo
  type          TEXT NOT NULL CHECK (type IN ('signup_bonus', 'purchase', 'consumption', 'refund')),
  reference_id  UUID,              -- ID da geração ou compra relacionada (nullable)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comentários
COMMENT ON TABLE public.credit_transactions IS 'Log de auditoria de todas as movimentações de créditos dos usuários.';
COMMENT ON COLUMN public.credit_transactions.amount IS 'Valor da transação: positivo para adições, negativo para consumo.';
COMMENT ON COLUMN public.credit_transactions.reference_id IS 'Referência opcional à geração (generations.id) ou compra relacionada.';

-- Habilitar Row Level Security
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Política: usuário só vê suas próprias transações
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Índice para consultas por usuário
CREATE INDEX idx_credit_tx_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_tx_created_at ON public.credit_transactions(created_at DESC);
