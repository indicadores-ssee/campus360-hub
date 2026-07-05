export type ScheduleMode = 'dual' | 'continuo';

export type BusinessHoursState = 'open' | 'lunch' | 'after-hours' | 'closing-soon';

export type HorarioRow = {
  horaAperturaM: string;
  horaCierreM: string | null;
  horarioAperturaT: string | null;
  horarioCierreT: string;
  modo: ScheduleMode;
  habilitado: boolean;
};

export type ScheduleStore = {
  horarios: Record<string, HorarioRow>;
  updatedAt: string;
};

export type ResolvedSchedule = {
  hasActiveSchedule: boolean;
  titulo?: string;
  horario?: HorarioRow;
  modo?: ScheduleMode;
  /** Perfil que solo aplica lun–vie (Normal). */
  weekdayOnly?: boolean;
};

export type ContactTimeOption = {
  value: string;
  label: string;
};

export const TITULO_HORARIO_NORMAL = 'Horario Normal';
export const TITULO_HORARIO_EXTENDIDO = 'Horario Extendido';

export const CLOSING_BUFFER_MINUTES = 10;
