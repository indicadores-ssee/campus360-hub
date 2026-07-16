'use client';

import { useCallback, useState } from 'react';

import { assignTurnoAtomic, submitFueraHorario } from '@/lib/simulation';
import type { FormData } from '@/types/form';

interface UseTurnAssignmentReturn {
  isSubmitting: boolean;
  submitError: string | null;
  assignTurno: (data: FormData, serviceLabel: string, origen?: string) => Promise<AssignResult>;
  assignFueraHorario: (
    data: FormData,
    serviceLabel: string,
    preSelectedContactTime?: string,
    origen?: string
  ) => Promise<AssignResult>;
  clearError: () => void;
}

interface AssignResult {
  success: boolean;
  turnoNumber?: string;
  zoomLink?: string;
  webZoomLink?: string;
  requestId?: string;
  error?: string;
}

export function useTurnAssignment(): UseTurnAssignmentReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const assignTurno = useCallback(
    async (
      data: FormData,
      serviceLabel: string,
      origen: string = 'TURNO'
    ): Promise<AssignResult> => {
      setIsSubmitting(true);
      setSubmitError(null);

      const modalidad = data.userType === 'aspirante' ? 'ASPIRANTE' : data.modalidad;

      const result = await assignTurnoAtomic(
        data.nombres,
        data.apellidos,
        data.cedula,
        data.email,
        data.telefono,
        serviceLabel,
        data.freeText,
        modalidad,
        origen,
        data.pais,
        data.prefijoTelefonico
      );

      if (!result.success) {
        setSubmitError(result.error ?? 'Error al asignar turno. Por favor intenta de nuevo.');
      }

      setIsSubmitting(false);
      return result;
    },
    []
  );

  const assignFueraHorario = useCallback(
    async (
      data: FormData,
      serviceLabel: string,
      preSelectedContactTime: string = '',
      origen: string = 'TURNO'
    ): Promise<AssignResult> => {
      setIsSubmitting(true);
      setSubmitError(null);

      const modalidad = data.userType === 'aspirante' ? 'ASPIRANTE' : data.modalidad;

      const result = await submitFueraHorario(
        data.nombres,
        data.apellidos,
        data.cedula,
        data.email,
        data.telefono,
        serviceLabel,
        data.freeText,
        modalidad,
        origen,
        preSelectedContactTime,
        data.pais,
        data.prefijoTelefonico
      );

      if (!result.success) {
        setSubmitError(result.error ?? 'Error al registrar tus datos. Por favor intenta de nuevo.');
      }

      setIsSubmitting(false);
      return result;
    },
    []
  );

  const clearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  return {
    isSubmitting,
    submitError,
    assignTurno,
    assignFueraHorario,
    clearError,
  };
}
