import { NextResponse } from 'next/server';
import { AIPipelineService } from '@/services/AIPipelineService';
import { createClient } from '@/lib/supabase/server';
import { getRateLimit, logSecurityEvent } from '@/lib/rate-limit';

export const maxDuration = 60; // Allow sufficient time for AI APIs

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Layer 2: API User-based Rate Limiting (3 requests per minute)
    const rateLimit = getRateLimit('user');
    if (rateLimit) {
      const { success } = await rateLimit.limit(`user_${userId}`);
      if (!success) {
        logSecurityEvent('rate_limit_exceeded', { layer: 'api', user_id: userId, path: '/api/enhance' });
        return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
      }
    }

    const { prompt, imageBase64 } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Valid prompt string is required' }, { status: 400 });
    }

    if (!imageBase64 || typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image')) {
      return NextResponse.json({ error: 'Valid image base64 string is required' }, { status: 400 });
    }

    // Limpar o base64 para buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');


    const result = await AIPipelineService.enhanceFoodImage({
      userId,
      imageBuffer,
    });

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || 'Failed to enhance image' }, { status: 500 });
    }

    // Convertendo buffer para Base64 Data URI
    const finalBase64Image = `data:image/jpeg;base64,${result.data.toString('base64')}`;

    return NextResponse.json({ success: true, image: finalBase64Image });
  } catch (error: unknown) {
    console.error('[API/enhance] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
