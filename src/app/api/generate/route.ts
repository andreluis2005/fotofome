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
        logSecurityEvent('rate_limit_exceeded', { layer: 'api', user_id: userId, path: '/api/generate' });
        return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
      }
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Valid prompt string is required' }, { status: 400 });
    }

    const result = await AIPipelineService.generateFoodImage({
      userId,
      foodDescription: prompt
    });

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || 'Failed to generate image' }, { status: 500 });
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

    if (!signedData?.signedUrl) {
      const base64Image = `data:image/jpeg;base64,${result.data.toString('base64')}`;
      return NextResponse.json({ success: true, image: base64Image });
    }

    return NextResponse.json({ success: true, image: signedData.signedUrl });
  } catch (error: unknown) {
    console.error('[API/generate] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
