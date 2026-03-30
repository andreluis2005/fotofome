import { NextResponse } from 'next/server';
import { AIPipelineService } from '@/services/AIPipelineService';
import { createClient } from '@/lib/supabase/server';
import { getRateLimit, logSecurityEvent } from '@/lib/rate-limit';

export const maxDuration = 60;

const MAX_PROMPT_LENGTH = 1000;
const ALLOWED_MIME_PREFIXES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: Request) {
  try {
    // S2: Validate Content-Type
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type deve ser application/json' }, { status: 415 });
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado. Faça login para continuar.' }, { status: 401 });
    }

    const userId = user.id;

    // Layer 2: API User-based Rate Limiting
    const rateLimit = getRateLimit('user');
    if (rateLimit) {
      const { success } = await rateLimit.limit(`user_${userId}_enhance`);
      if (!success) {
        logSecurityEvent('rate_limit_exceeded', { layer: 'api', user_id: userId, path: '/api/enhance' });
        return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 });
      }
    }

    const body = await req.json();
    const { image_url } = body;

    if (!image_url || typeof image_url !== 'string') {
      return NextResponse.json({ error: 'URL de imagem válida é obrigatória' }, { status: 400 });
    }

    // S4: Validate prompt length if custom prompt is provided
    if (body.prompt && typeof body.prompt === 'string' && body.prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json({ error: `Prompt deve ter no máximo ${MAX_PROMPT_LENGTH} caracteres` }, { status: 400 });
    }

    // Call Pipeline (2 credits consumed internally if success)
    const result = await AIPipelineService.enhanceFoodImage({
      userId,
      imageUrl: image_url,
    });

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || 'Falha ao melhorar imagem' }, { status: 500 });
    }

    // Store generated result in Supabase "generations" bucket
    const fileName = `${userId}/${Date.now()}_enhanced.jpeg`;
    const { error: uploadError } = await supabase.storage
      .from('generations')
      .upload(fileName, result.data, { contentType: 'image/jpeg' });
      
    if (uploadError) {
      console.error("[API/enhance] Storage save failed:", uploadError);
      return NextResponse.json({ error: 'Falha ao salvar imagem melhorada' }, { status: 500 });
    }

    // Fetch Private Signed URL valid for 24 hours
    const { data: signedData } = await supabase.storage
      .from('generations')
      .createSignedUrl(fileName, 60 * 60 * 24);

    if (!signedData?.signedUrl) {
      return NextResponse.json({ error: 'Falha ao gerar URL assinada' }, { status: 500 });
    }

    // B5: Persist generation record for history dashboard
    await supabase.from('generations').insert({
      user_id: userId,
      mode: 'enhance',
      input_url: image_url,
      output_url: signedData.signedUrl,
      credits_used: 2,
      status: 'completed',
    });

    return NextResponse.json({ success: true, image: signedData.signedUrl });
  } catch (error: unknown) {
    console.error('[API/enhance] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
