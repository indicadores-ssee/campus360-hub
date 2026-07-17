const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

const MAX_FIELD_LENGTH = 500;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.length > MAX_FIELD_LENGTH) {
    return trimmed.slice(0, MAX_FIELD_LENGTH);
  }
  if (
    trimmed.startsWith('=') ||
    trimmed.startsWith('+') ||
    trimmed.startsWith('-') ||
    trimmed.startsWith('@')
  ) {
    return `'${trimmed}`;
  }
  return trimmed;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} es requerido`;
  }
  return null;
}

function validateEcuadorianCedula(cedula: string): boolean {
  if (cedula.length !== 10) return false;

  const digits = cedula.split('').map(Number);

  const province = digits[0] * 10 + digits[1];
  if (province < 1 || province > 24) return false;

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    const product = digits[i] * coefficients[i];
    sum += product >= 10 ? product - 9 : product;
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === digits[9];
}

function validateEcuadorianRuc(ruc: string): boolean {
  if (ruc.length !== 13) return false;

  const first10 = ruc.slice(0, 10);
  return validateEcuadorianCedula(first10);
}

function validatePassport(id: string): boolean {
  if (id.length < 6 || id.length > 20) return false;
  return /^[A-Za-z0-9]+$/.test(id);
}

export function validateIdentification(id: string): string | null {
  // ponytail: validador comentado, acepta cualquier valor
  // if (!id || id.trim().length === 0) {
  //   return 'La identificación es requerida';
  // }

  // const cleaned = id.trim();

  // if (/^\d+$/.test(cleaned)) {
  //   if (cleaned.length === 10) {
  //     if (!validateEcuadorianCedula(cleaned)) {
  //       return 'Cédula inválida (dígito verificador incorrecto)';
  //     }
  //     return null;
  //   }
  //   if (cleaned.length === 13) {
  //     if (!validateEcuadorianRuc(cleaned)) {
  //       return 'RUC inválido';
  //     }
  //     return null;
  //   }
  //   return 'Identificación debe tener 10 dígitos (cédula) o 13 dígitos (RUC)';
  // }

  // if (validatePassport(cleaned)) {
  //   return null;
  // }

  // return 'Identificación inválida (use cédula, RUC o pasaporte)';
  return null;
}

export function validatePhone(phone: string, expectedDigits?: number[]): string | null {
  const cleaned = phone.replaceAll(/\D/g, '');

  if (expectedDigits && expectedDigits.length > 0) {
    if (!expectedDigits.includes(cleaned.length)) {
      const expected = expectedDigits.join(' o ');
      return `El teléfono debe tener ${expected} dígitos`;
    }
    return null;
  }

  if (cleaned.length < 7 || cleaned.length > 15) {
    return 'El teléfono debe tener entre 7 y 15 dígitos';
  }

  return null;
}