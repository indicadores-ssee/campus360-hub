import { NextResponse } from 'next/server';

import {
  persistCategories,
  refreshCategoriesFromPayload,
} from '@/lib/server/category-service';
import { checkRateLimit, getClientIp } from '@/lib/server/api-utilities';
import { verifyRefreshSecret } from '@/lib/server/refresh-auth';

export async function POST(request: Request) {
  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!verifyRefreshSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const raw: unknown = await request.json();
    const categories = refreshCategoriesFromPayload(raw);
    await persistCategories(categories);

    return NextResponse.json({ success: true, count: categories.length });
  } catch (error) {
    console.error('[api/categorias/refresh] Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
