import { NextResponse } from 'next/server';

import { getCountryByName } from '@/data/countries';
import {
  checkRateLimit,
  getClientIp,
  sanitizeInput,
  validateIdentification,
  validatePhone,
  validateRequired,
} from '@/lib/server/api-utilities';
import { getNextTurnoNumber } from '@/lib/server/turno-counter';
import { enqueueTurno } from '@/lib/server/turno-queue';
import { WEBHOOK_URLS } from '@/lib/server/power-automate';
import { generateZoomLink, generateWebZoomLink } from '@/lib/server/zoom';
import { canAcceptTurnosFromState } from '@/lib/schedule-core';
import { getCurrentBusinessHoursState } from '@/lib/server/schedule-service';

function todayDateOnly(): string {
  const d = new Date();
  const ecuadorOffsetMs = -5 * 60 * 60 * 1000;
  const ecuadorDate = new Date(d.getTime() + ecuadorOffsetMs);
  return `${String(ecuadorDate.getUTCDate()).padStart(2, '0')}/${String(ecuadorDate.getUTCMonth() + 1).padStart(2, '0')}/${ecuadorDate.getUTCFullYear()}`;
}

function getFechaHora(): string {
  return new Date().toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

interface AsignarTurnoData {
  requestId?: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  telefono: string;
  servicio: string;
  freeText?: string;
  modalidad?: string;
  origen: string;
  pais?: string;
  prefijoTelefonico?: string;
}

async function procesarAsignacion(data: AsignarTurnoData) {
  const today = todayDateOnly();
  const turnoNumber = await getNextTurnoNumber(today);
  const fechaHora = getFechaHora();
  const nombreCompleto = `${data.nombres} ${data.apellidos}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  await enqueueTurno(baseUrl, {
    requestId: data.requestId,
    turno: sanitizeInput(turnoNumber),
    fecha: sanitizeInput(fechaHora),
    nombres: sanitizeInput(nombreCompleto),
    cedula: sanitizeInput(data.cedula),
    email: sanitizeInput(data.email),
    pais: sanitizeInput(data.pais ?? 'Ecuador'),
    prefijo: sanitizeInput(data.prefijoTelefonico ?? '+593'),
    telefono: sanitizeInput(data.telefono),
    modalidad: sanitizeInput(data.modalidad ?? '-'),
    servicio: sanitizeInput(data.servicio),
    detalle: sanitizeInput(data.freeText ?? ''),
    origen: sanitizeInput(data.origen),
    asesor: '',
  }, WEBHOOK_URLS.crearTurno);

  const zoomLink = generateZoomLink(turnoNumber, data.nombres, data.apellidos);
  const webZoomLink = generateWebZoomLink(turnoNumber, data.nombres, data.apellidos);

  return { turnoNumber, zoomLink, webZoomLink, requestId: data.requestId };
}

export async function PUT(request: Request) {
  try {
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const data: AsignarTurnoData = await request.json();

    if (action === 'reasignar') {
      // Reasignar no requiere validación de campos, solo genera nuevo turno
      const result = await procesarAsignacion(data);
      console.log(`Turno reasignado: ${result.turnoNumber} para ${data.nombres} ${data.apellidos}`);
      return NextResponse.json({ success: true, ...result });
    }

    if (action !== 'asignar') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const businessHoursState = await getCurrentBusinessHoursState();
    if (!canAcceptTurnosFromState(businessHoursState)) {
      return NextResponse.json(
        { error: 'Fuera de horario de atención (hora Ecuador). No se pueden asignar turnos.' },
        { status: 403 }
      );
    }

    const errors: string[] = [
      validateRequired(data.nombres, 'Nombres') ?? '',
      validateRequired(data.apellidos, 'Apellidos') ?? '',
      validateRequired(data.cedula, 'Cédula') ?? '',
      validateRequired(data.email, 'Correo') ?? '',
      validateRequired(data.telefono, 'Teléfono') ?? '',
      validateRequired(data.servicio, 'Servicio') ?? '',
    ];

    const cedulaError = validateIdentification(data.cedula);
    if (cedulaError) errors.push(cedulaError);

    const country = getCountryByName(data.pais ?? 'Ecuador');
    const phoneError = validatePhone(data.telefono, country?.phoneDigits);
    if (phoneError) errors.push(phoneError);

    const validErrors = errors.filter((errorMessage) => errorMessage !== '');
    if (validErrors.length > 0) {
      return NextResponse.json({ error: validErrors.join(', ') }, { status: 400 });
    }

    const result = await procesarAsignacion(data);
    console.log(`Turno ${result.turnoNumber} asignado a ${data.nombres} ${data.apellidos}`);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error:', String(error));
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
