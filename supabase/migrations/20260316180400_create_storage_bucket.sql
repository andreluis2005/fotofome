-- Migration 05: Bucket de storage para imagens geradas pela IA
-- Cada usuário terá uma pasta própria: generations/{user_id}/

INSERT INTO storage.buckets (id, name, public)
VALUES ('generations', 'generations', true)
ON CONFLICT DO NOTHING;

-- Política: usuários autenticados podem fazer upload apenas na sua própria pasta
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'generations'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: imagens são públicas para leitura (URLs compartilháveis)
CREATE POLICY "Public read access for generations"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generations');
