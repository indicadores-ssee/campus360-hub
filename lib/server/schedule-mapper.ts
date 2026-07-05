import { normalizeTime } from '@/lib/schedule-core';
import type { HorarioRow, ScheduleMode } from '@/types/schedule';
import { TITULO_HORARIO_EXTENDIDO, TITULO_HORARIO_NORMAL } from '@/types/schedule';

type SharePointChoiceField = {
  Value?: string;
};

type UnknownRecord = Record<string, unknown>;

function normalizeKey(key: string): string {
  return key
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function pickValue(record: UnknownRecord, aliases: string[]): unknown {
  const aliasSet = new Set(aliases.map(normalizeKey));
  for (const [key, value] of Object.entries(record)) {
    if (aliasSet.has(normalizeKey(key)) && value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

function readFieldValue(value: unknown): string {
  if (!value || typeof value !== 'object') return String(value ?? '').trim();
  return String((value as SharePointChoiceField).Value ?? '').trim();
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || String(value).trim() === '';
}

function parseHabilitado(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;

  const normalized = readFieldValue(value).toLowerCase();
  if (['si', 'sí', 'yes', 'true', '1', 'activado', 'activada'].includes(normalized)) {
    return true;
  }
  if (['no', 'false', '0', 'desactivado', 'desactivada'].includes(normalized)) {
    return false;
  }

  return fallback;
}

function resolveTimeField(
  body: UnknownRecord,
  aliases: string[],
  existing: string | null | undefined
): string | null {
  const raw = pickValue(body, aliases);
  if (raw === undefined) return existing ?? null;
  if (isEmpty(raw)) return null;
  return normalizeTime(readFieldValue(raw));
}

function detectMode(horaCierreM: string | null, horarioAperturaT: string | null): ScheduleMode {
  if (!horaCierreM && !horarioAperturaT) return 'continuo';
  return 'dual';
}

function normalizeTitulo(raw: string): string {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('extendido')) return TITULO_HORARIO_EXTENDIDO;
  if (lower.includes('normal')) return TITULO_HORARIO_NORMAL;

  return trimmed;
}

export function mapSharePointSchedulePayload(
  body: UnknownRecord,
  existing?: HorarioRow
): { titulo: string; row: HorarioRow } {
  const tituloRaw = readFieldValue(
    pickValue(body, ['Titulo', 'Title', 'titulo', 'title'])
  );
  const titulo = normalizeTitulo(tituloRaw);

  if (!titulo) {
    throw new Error('Titulo es obligatorio en el payload de horarios.');
  }

  const horaAperturaM =
    resolveTimeField(body, ['HoraAperturaM', 'HoraAperturaManana', 'HoraApertura'], existing?.horaAperturaM) ??
    null;
  const horarioCierreT =
    resolveTimeField(body, ['HorarioCierreT', 'HoraCierreT', 'HorarioCierre'], existing?.horarioCierreT) ??
    null;
  const horaCierreM = resolveTimeField(
    body,
    ['HoraCierreM', 'HoraCierreManana'],
    existing?.horaCierreM
  );
  const horarioAperturaT = resolveTimeField(
    body,
    ['HorarioAperturaT', 'HoraAperturaTarde', 'HorarioApertura'],
    existing?.horarioAperturaT
  );

  if (!horaAperturaM || !horarioCierreT) {
    throw new Error('HoraAperturaM y HorarioCierreT son obligatorios.');
  }

  const habilitado = parseHabilitado(
    pickValue(body, ['habilitado', 'Habilitado', 'RecibirRespuestas']),
    existing?.habilitado ?? false
  );

  const modo = detectMode(horaCierreM, horarioAperturaT);

  if (modo === 'dual' && (!horaCierreM || !horarioAperturaT)) {
    throw new Error('Horario dual requiere HoraCierreM y HorarioAperturaT.');
  }

  return {
    titulo,
    row: {
      horaAperturaM,
      horaCierreM,
      horarioAperturaT,
      horarioCierreT,
      modo,
      habilitado,
    },
  };
}
