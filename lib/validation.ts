import { getCountryByName } from '@/data/countries';
import type { FormData, ValidationErrors } from '@/types/form';

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

function validateIdentificationClient(id: string): string | null {
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

export function validateStep(data: FormData, step: number): ValidationErrors {
  const newErrors: ValidationErrors = {};

  if (step === 1) {
    if (!data.userType) {
      newErrors.userType = 'Debes seleccionar tu tipo de usuario';
    }
  }

  if (step === 2) {
    if (!data.nombres?.trim()) newErrors.nombres = 'Ingresa tus nombres completos';
    if (!data.apellidos?.trim()) newErrors.apellidos = 'Ingresa tus apellidos completos';

    const cedulaError = validateIdentificationClient(data.cedula);
    if (cedulaError) newErrors.cedula = cedulaError;

    if (!data.acceptedPrivacy) {
      newErrors.acceptedPrivacy = 'Debes aceptar la política de privacidad';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email ?? '')) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }
    if (data.userType === 'estudiante' && !data.modalidad) {
      newErrors.modalidad = 'Selecciona tu modalidad de estudio';
    }

    const phoneDigits = (data.telefono ?? '').replaceAll(/\D/g, '');
    if (!phoneDigits) {
      newErrors.telefono = 'El teléfono es requerido';
    } else {
      const country = getCountryByName(data.pais);
      const expectedLengths = country?.phoneDigits ?? null;

      if (expectedLengths) {
        if (!expectedLengths.includes(phoneDigits.length)) {
          const expected = expectedLengths.join(' o ');
          newErrors.telefono = `En ${data.pais} el teléfono debe tener ${expected} dígitos`;
        }
      } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        newErrors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos';
      }
    }
  }

  if (step === 3) {
    if (!data.selectedCategoryId) {
      newErrors.selectedCategoryId = 'Debes seleccionar una categoría de servicio';
    }
  }

  if (step === 4) {
    if (data.userType === 'estudiante' && !data.requirementType) {
      newErrors.requirementType = 'Debes seleccionar el tipo de requerimiento';
    }
    if (!data.freeText?.trim()) {
      newErrors.freeText = 'Debes describir tu requerimiento';
    } else if (data.freeText.trim().length < 15) {
      newErrors.freeText = 'El detalle debe tener al menos 15 caracteres';
    }
  }

  return newErrors;
}

export function isValidStep(data: FormData, step: number): boolean {
  const errors = validateStep(data, step);
  return Object.keys(errors).length === 0;
}