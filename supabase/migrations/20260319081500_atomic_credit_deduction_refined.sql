-- Migration: Função atômica para dedução de créditos
-- Previne Race Conditions sob alta concorrência de requisições de IA

CREATE OR REPLACE FUNCTION public.decrement_credits(amount INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_remaining_credits INTEGER;
  v_updated_count INTEGER;
BEGIN
  -- 1. Capturar e validar auth.uid() de forma segura (impede spoofing de user_id)
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Usuário não autenticado.';
  END IF;

  -- 2. Validação rigorosa de Input
  IF amount IS NULL OR amount <= 0 THEN
    RAISE EXCEPTION 'Bad Request: A quantidade a deduzir deve ser maior que zero.';
  END IF;

  -- 3. True Atomic Update
  -- Tenta decrementar apenas se saldo for suficiente na leitura transacional.
  WITH updated AS (
    UPDATE public.profiles
    SET credits = credits - amount
    WHERE id = v_user_id AND credits >= amount
    RETURNING credits
  )
  SELECT count(*), COALESCE(max(credits), 0)
  INTO v_updated_count, v_remaining_credits
  FROM updated;

  -- 4. Tratamento de Cenários de Borda
  IF v_updated_count = 0 THEN
    -- Pode ser saldo insuficiente ou perfil que não existe
    RETURN json_build_object(
      'success', false,
      'remaining_credits', 0
    );
  END IF;

  -- 5. Registrar no log de auditoria com consistência transacional
  INSERT INTO public.credit_transactions (user_id, amount, type)
  VALUES (v_user_id, -amount, 'consumption');

  -- 6. Sucesso estruturado retornado
  RETURN json_build_object(
    'success', true,
    'remaining_credits', v_remaining_credits
  );

END;
$$;

COMMENT ON FUNCTION public.decrement_credits(INTEGER) IS 'Deduz créditos atomicamente baseando-se no auth.uid() retornado JSON estruturado.';
