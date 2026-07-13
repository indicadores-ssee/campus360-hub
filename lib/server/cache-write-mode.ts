export type CacheWriteMode = 'refresh' | 'fallback';

const FALLBACK_TTL_SECONDS = 21_600; // 6 horas

// 'refresh' (horario) no expira: solo se reescribe cuando Power Automate
// detecta un cambio real en SharePoint, que puede tardar meses.
export function getRedisSetOptions(mode: CacheWriteMode): { ex: number } | undefined {
  return mode === 'refresh' ? undefined : { ex: FALLBACK_TTL_SECONDS };
}
