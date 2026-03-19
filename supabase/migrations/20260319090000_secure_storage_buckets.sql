-- Criação do bucket privado para as imagens originais enviadas pelo logista
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food-images', 'food-images', false)
ON CONFLICT DO NOTHING;

-- RLS para inserção no food-images (Somente na própria pasta UUID)
CREATE POLICY "Users can upload to own food-images folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'food-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS para leitura no food-images (Somente a própria pasta UUID)
CREATE POLICY "Users can view own food-images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'food-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Refinamento de Segurança: Tornar o bucket 'generations' (criado anteriormente) PRIVADO
UPDATE storage.buckets SET public = false WHERE id = 'generations';

-- Remover acesso público antigo
DROP POLICY IF EXISTS "Public read access for generations" ON storage.objects;

-- Criar acesso apenas para o dono
CREATE POLICY "Users can view own generations"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'generations' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
