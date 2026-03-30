import { NextResponse } from 'next/server';
import { AIPipelineService } from '@/services/AIPipelineService';
import { createClient } from '@/lib/supabase/server';
import { getRateLimit, logSecurityEvent } from '@/lib/rate-limit';

export const maxDuration = 60;

const MAX_PROMPT_LENGTH = 1000;

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

    // Layer 2: API User-based Rate Limiting (3 requests per minute)
    const rateLimit = getRateLimit('user');
    if (rateLimit) {
      const { success } = await rateLimit.limit(`user_${userId}`);
      if (!success) {
        logSecurityEvent('rate_limit_exceeded', { layer: 'api', user_id: userId, path: '/api/generate' });
        return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 });
      }
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Um prompt de texto válido é obrigatório' }, { status: 400 });
    }

    // S4: Validate prompt length
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json({ error: `Prompt deve ter no máximo ${MAX_PROMPT_LENGTH} caracteres` }, { status: 400 });
    }

    const result = await AIPipelineService.generateFoodImage({
      userId,
      foodDescription: prompt
    });

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || 'Falha ao gerar imagem' }, { status: 500 });
    }

    // Store generated result in Supabase "generations" bucket
    const fileName = `${userId}/${Date.now()}_generated.jpeg`;
    const { error: uploadError } = await supabase.storage
      .from('generations')
      .upload(fileName, result.data, { contentType: 'image/jpeg' });
      
    if (uploadError) {
      console.error("[API/generate] Storage save failed, yielding legacy fallback:", uploadError);
      const base64Image = `data:image/jpeg;base64,${result.data.toString('base64')}`;
      return NextResponse.json({ success: true, image: base64Image });
    }

    // Fetch Private Signed URL valid for 24 hours
    const { data: signedData } = await supabase.storage
      .from('generations')
      .createSignedUrl(fileName, 60 * 60 * 24);

    const finalUrl = signedData?.signedUrl 
      ? signedData.signedUrl 
      : `data:image/jpeg;base64,${result.data.toString('base64')}`;

    // B5: Persist generation record for history dashboard
    await supabase.from('generations').insert({
      user_id: userId,
      mode: 'generate',
      prompt: prompt.substring(0, 500),
      output_url: finalUrl,
      credits_used: 1,
      status: 'completed',
    });

    return NextResponse.json({ success: true, image: finalUrl });
  } catch (error: unknown) {
    console.error('[API/generate] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
