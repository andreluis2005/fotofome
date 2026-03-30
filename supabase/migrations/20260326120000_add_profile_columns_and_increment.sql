-- Migration: Add missing profile columns, index, and atomic increment_credits RPC
-- Addresses: D1 (missing columns), D3 (missing index), D4/S3 (non-atomic addCredits)

-- D1: Colunas que o signup envia via user_metadata mas faltam nas migrações
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS niche TEXT DEFAULT 'Delivery';

-- D3: Índice para queries por tier (billing, feature-gating)
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON public.profiles(tier);

-- D4/S3: RPC atômica para incrementar créditos (espelho do decrement_credits)
-- Previne race conditions em compras simultâneas
CREATE OR REPLACE FUNCTION public.increment_credits(amount INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_new_credits INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Usuário não autenticado.';
  END IF;

  IF amount IS NULL OR amount <= 0 THEN
    RAISE EXCEPTION 'Bad Request: A quantidade deve ser maior que zero.';
  END IF;

  UPDATE public.profiles
  SET credits = credits + amount
  WHERE id = v_user_id
  RETURNING credits INTO v_new_credits;

  IF v_new_credits IS NULL THEN
    RETURN json_build_object('success', false, 'remaining_credits', 0);
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, type)
  VALUES (v_user_id, amount, 'purchase');

  RETURN json_build_object('success', true, 'remaining_credits', v_new_credits);
END;
$$;

COMMENT ON FUNCTION public.increment_credits(INTEGER) IS 'Incrementa créditos atomicamente via auth.uid(). Retorna JSON estruturado.';
