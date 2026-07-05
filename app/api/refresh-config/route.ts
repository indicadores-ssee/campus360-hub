import { NextResponse } from 'next/server';

import { checkRateLimit, getClientIp } from '@/lib/server/api-utilities';
import { verifyRefreshSecret } from '@/lib/server/refresh-auth';
import { upsertScheduleFromPayload } from '@/lib/server/schedule-service';

export async function POST(request: Request) {
  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!verifyRefreshSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { store, resolved } = await upsertScheduleFromPayload(body);

    return NextResponse.json({
      success: true,
      resolved,
      horarios: store.horarios,
      updatedAt: store.updatedAt,
    });
  } catch (error) {
    console.error('[api/refresh-config] Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
