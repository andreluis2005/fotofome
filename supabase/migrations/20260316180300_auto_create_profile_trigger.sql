-- Migration 04: Trigger automático para criar perfil quando novo usuário se cadastra
-- Isso garante que todo usuário do auth.users tenha um perfil correspondente,
-- sem depender do código do frontend.

-- Função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    5  -- créditos iniciais de boas-vindas
  );

  -- Registrar a transação de bônus de signup
  INSERT INTO public.credit_transactions (user_id, amount, type)
  VALUES (
    NEW.id,
    5,
    'signup_bonus'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário na função
COMMENT ON FUNCTION public.handle_new_user() IS 'Cria perfil e concede créditos de boas-vindas automaticamente ao cadastro do usuário.';

-- Criar o trigger no auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
