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

    // Layer 2: API User-based Rate Limiting
    const rateLimit = getRateLimit('user');
    if (rateLimit) {
      const { success } = await rateLimit.limit(`user_${userId}_enhance`);
      if (!success) {
        logSecurityEvent('rate_limit_exceeded', { layer: 'api', user_id: userId, path: '/api/enhance' });
        return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
      }
    }

    const { image_url } = await req.json();

    if (!image_url || typeof image_url !== 'string') {
      return NextResponse.json({ error: 'Valid image_url is required for enhancement' }, { status: 400 });
    }

    // Call Pipeline (2 credits consumed internally if success)
    const result = await AIPipelineService.enhanceFoodImage({
      userId,
      imageUrl: image_url,
    });

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || 'Failed to enhance image' }, { status: 500 });
    }

    // Store generated result in Supabase "generations" bucket
    const fileName = `${userId}/${Date.now()}_enhanced.jpeg`;
    const { error: uploadError } = await supabase.storage
      .from('generations')
      .upload(fileName, result.data, { contentType: 'image/jpeg' });
      
    if (uploadError) {
      console.error("[API/enhance] Storage save failed:", uploadError);
      return NextResponse.json({ error: 'Failed to save enhanced image to storage' }, { status: 500 });
    }

    // Fetch Private Signed URL valid for 24 hours
    const { data: signedData } = await supabase.storage
      .from('generations')
      .createSignedUrl(fileName, 60 * 60 * 24);

    if (!signedData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }

    return NextResponse.json({ success: true, image: signedData.signedUrl });
  } catch (error: unknown) {
    console.error('[API/enhance] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
