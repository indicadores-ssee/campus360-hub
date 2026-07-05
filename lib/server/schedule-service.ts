import {
  createDefaultScheduleStore,
  createEmptyScheduleStore,
  getBusinessHoursStateFromResolved,
  getEcuadorClock,
  getMockState,
  resolveActiveSchedule,
  buildScheduleSummaryMessage,
  buildContactTimeOptions,
  getLunchResumeTime,
  type EcuadorClock,
} from '@/lib/schedule-core';
import { mapSharePointSchedulePayload } from '@/lib/server/schedule-mapper';
import { isScheduleKvEnabled, readScheduleFromKv, writeScheduleToKv } from '@/lib/server/schedule-kv';
import { TITULO_HORARIO_EXTENDIDO, TITULO_HORARIO_NORMAL } from '@/types/schedule';
import type { BusinessHoursState, HorarioRow, ResolvedSchedule, ScheduleStore } from '@/types/schedule';

export type ScheduleStoreSource = 'kv' | 'empty' | 'mock';

export type ScheduleConfigMeta = {
  source: ScheduleStoreSource;
  redisEnabled: boolean;
  mockActive: boolean;
  ecuadorTime: string;
  isWeekday: boolean;
};

export async function getScheduleStoreWithMeta(): Promise<{
  store: ScheduleStore;
  source: ScheduleStoreSource;
  redisEnabled: boolean;
}> {
  const redisEnabled = isScheduleKvEnabled();
  if (!redisEnabled) {
    console.error('[schedule-service] Redis no configurado (UPSTASH_REDIS_REST_URL/TOKEN)');
    return { store: createEmptyScheduleStore(), source: 'empty', redisEnabled: false };
  }

  try {
    const cached = await readScheduleFromKv();
    if (cached) {
      return { store: cached, source: 'kv', redisEnabled: true };
    }
    return { store: createEmptyScheduleStore(), source: 'empty', redisEnabled: true };
  } catch (error) {
    console.error('[schedule-service] Error leyendo KV:', error);
    return { store: createEmptyScheduleStore(), source: 'empty', redisEnabled: true };
  }
}

export async function getScheduleStore(): Promise<ScheduleStore> {
  const { store } = await getScheduleStoreWithMeta();
  return store;
}

export async function getResolvedSchedule(clock: EcuadorClock = getEcuadorClock()): Promise<ResolvedSchedule> {
  const store = await getScheduleStore();
  return resolveActiveSchedule(store, clock);
}

export async function getCurrentBusinessHoursState(): Promise<BusinessHoursState> {
  const clock = getEcuadorClock();
  const resolved = await getResolvedSchedule(clock);
  return getBusinessHoursStateFromResolved(resolved, clock);
}

function normalizeTituloHint(tituloHint: string): string {
  const lower = tituloHint.toLowerCase();
  if (lower.includes('extendido')) return TITULO_HORARIO_EXTENDIDO;
  if (lower.includes('normal')) return TITULO_HORARIO_NORMAL;
  return tituloHint;
}

export function refreshScheduleFromPayload(
  body: Record<string, unknown>,
  currentStore: ScheduleStore
): ScheduleStore {
  const tituloHint = String(
    body.Titulo ?? body.Title ?? body.titulo ?? body.title ?? ''
  ).trim();
  const normalizedHint = tituloHint ? normalizeTituloHint(tituloHint) : '';
  const existing = normalizedHint ? currentStore.horarios[normalizedHint] : undefined;
  const { titulo, row } = mapSharePointSchedulePayload(body, existing);

  return {
    horarios: {
      ...currentStore.horarios,
      [titulo]: row,
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function persistScheduleStore(store: ScheduleStore): Promise<void> {
  await writeScheduleToKv(store, 'refresh');
}

export async function upsertScheduleFromPayload(body: Record<string, unknown>): Promise<{
  store: ScheduleStore;
  resolved: ResolvedSchedule;
}> {
  const currentStore = await getScheduleStore();
  const store = refreshScheduleFromPayload(body, currentStore);
  await persistScheduleStore(store);
  const clock = getEcuadorClock();
  return { store, resolved: resolveActiveSchedule(store, clock) };
}

export function getSchedulePresentation(store: ScheduleStore, horario: HorarioRow | null) {
  if (!horario) {
    return {
      message: buildScheduleSummaryMessage(store),
      contactTimeOptions: [] as ReturnType<typeof buildContactTimeOptions>,
      lunchResumeTime: null as string | null,
    };
  }

  return {
    message: buildScheduleSummaryMessage(store),
    contactTimeOptions: buildContactTimeOptions(horario),
    lunchResumeTime: getLunchResumeTime(horario),
  };
}

export async function getScheduleConfigSnapshot(): Promise<{
  store: ScheduleStore;
  resolved: ResolvedSchedule;
  state: BusinessHoursState;
  meta: ScheduleConfigMeta;
}> {
  const clock = getEcuadorClock();
  const hours = Math.floor(clock.minutes / 60);
  const mins = clock.minutes % 60;
  const ecuadorTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

  const mock = getMockState();
  if (mock) {
    const store = createDefaultScheduleStore();
    const resolved = resolveActiveSchedule(store, clock);
    return {
      store,
      resolved,
      state: mock,
      meta: {
        source: 'mock',
        redisEnabled: isScheduleKvEnabled(),
        mockActive: true,
        ecuadorTime,
        isWeekday: clock.isWeekday,
      },
    };
  }

  const { store, source, redisEnabled } = await getScheduleStoreWithMeta();
  const resolved = resolveActiveSchedule(store, clock);
  const state = getBusinessHoursStateFromResolved(resolved, clock);

  return {
    store,
    resolved,
    state,
    meta: {
      source,
      redisEnabled,
      mockActive: false,
      ecuadorTime,
      isWeekday: clock.isWeekday,
    },
  };
}
