import { NextResponse } from 'next/server';
import { AIPipelineService } from '@/services/AIPipelineService';
import { createClient } from '@/lib/supabase/server';
import { getRateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Rate Limiting
    const rateLimit = getRateLimit('user');
    if (rateLimit) {
      const { success } = await rateLimit.limit(`user_${userId}_menu`);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
      }
    }

    const { image_url, food_description } = await req.json();

    if (!image_url) {
      return NextResponse.json({ error: 'image_url is required' }, { status: 400 });
    }

    const result = await AIPipelineService.generateMenuData({
      userId,
      imageUrl: image_url,
      foodDescription: food_description
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to generate menu data' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: unknown) {
    console.error('[API/menu/generate] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
