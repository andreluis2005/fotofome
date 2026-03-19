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

    const { prompt, imageBase64, image_url } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Valid prompt string is required' }, { status: 400 });
    }

    let imageBuffer: Buffer;

    if (image_url) {
      // Flow 1: Supabase Storage Integration (New Pattern)
      const fileRes = await fetch(image_url);
      if (!fileRes.ok) {
        return NextResponse.json({ error: 'Failed to retrieve uploaded image from storage' }, { status: 400 });
      }
      const arrayBuffer = await fileRes.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else if (imageBase64) {
      // Flow 2: Legacy Base64 Integration (Fallback / Backward-Compatibility)
      if (typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image')) {
        return NextResponse.json({ error: 'Valid image base64 string is required' }, { status: 400 });
      }
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      return NextResponse.json({ error: 'Missing valid image source (image_url or imageBase64)' }, { status: 400 });
    }

    const result = await AIPipelineService.enhanceFoodImage({
      userId,
      imageBuffer,
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
      console.error("[API/enhance] Storage save failed, yielding legacy fallback:", uploadError);
      const finalBase64Image = `data:image/jpeg;base64,${result.data.toString('base64')}`;
      return NextResponse.json({ success: true, image: finalBase64Image });
    }

    // Fetch Private Signed URL valid for 24 hours
    const { data: signedData } = await supabase.storage
      .from('generations')
      .createSignedUrl(fileName, 60 * 60 * 24);

    if (!signedData?.signedUrl) {
      const finalBase64Image = `data:image/jpeg;base64,${result.data.toString('base64')}`;
      return NextResponse.json({ success: true, image: finalBase64Image });
    }

    return NextResponse.json({ success: true, image: signedData.signedUrl });
  } catch (error: unknown) {
    console.error('[API/enhance] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
