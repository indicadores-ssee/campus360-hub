import type { CacheWriteMode } from '@/lib/server/cache-write-mode';
import { getRedisSetOptions } from '@/lib/server/cache-write-mode';
import { getRedis, isRedisEnabled } from '@/lib/server/redis-client';
import type { ScheduleStore } from '@/types/schedule';

export const SCHEDULE_KV_KEY = 'campus360:schedule-config';

export async function readScheduleFromKv(): Promise<ScheduleStore | null> {
  const redis = getRedis();
  if (!redis) return null;

  const data = await redis.get<ScheduleStore>(SCHEDULE_KV_KEY);
  return data ?? null;
}

export async function writeScheduleToKv(
  store: ScheduleStore,
  mode: CacheWriteMode = 'fallback'
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const options = getRedisSetOptions(mode);
  if (options) {
    await redis.set(SCHEDULE_KV_KEY, store, options);
  } else {
    await redis.set(SCHEDULE_KV_KEY, store);
  }
}

export function isScheduleKvEnabled(): boolean {
  return isRedisEnabled();
}
