import { NextResponse } from 'next/server';
import { AIPipelineService } from '@/services/AIPipelineService';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60; // Allow sufficient time for AI APIs

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

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

    // Convertendo buffer para Base64 Data URI
    const base64Image = `data:image/jpeg;base64,${result.data.toString('base64')}`;

    return NextResponse.json({ success: true, image: base64Image });
  } catch (error: unknown) {
    console.error('[API/generate] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
