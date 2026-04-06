// Utilidades de validación
// Funciones helpers para validación de datos

// =====================
// RUT CHILENO
// =====================

/**
 * Valida si un string es un RUT chileno válido
 * Formato esperado: 12345678-9 o 1234567-8
 */
export function isValidRut(rut: string): boolean {
  if (!rut) return false;

  // Limpiar espacios y convertir a mayúsculas
  const cleanRut = rut.replace(/\s/g, '').toUpperCase();

  // Verificar formato básico: XXXXXXXX-X
  const rutRegex = /^\d{1,8}-[0-9K]$/;
  if (!rutRegex.test(cleanRut)) {
    return false;
  }

  const [body, verifier] = cleanRut.split('-');

  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  let expectedVerifier: string;

  if (remainder === 11) {
    expectedVerifier = '0';
  } else if (remainder === 10) {
    expectedVerifier = 'K';
  } else {
    expectedVerifier = remainder.toString();
  }

  return expectedVerifier === verifier;
}

/**
 * Limpia un RUT (elimina puntos, guiones, espacios)
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[\s.-]/g, '').toUpperCase();
}

/**
 * Formatea un RUT con guión
 */
export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return rut;

  const body = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1);

  // Agregar puntos a los miles
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formatted}-${verifier}`;
}

// =====================
// EMAIL
// =====================

/**
 * Valida formato básico de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// =====================
// PASSWORD
// =====================

/**
 * Valida que la contraseña cumpla requisitos mínimos
 */
export function isValidPassword(
  password: string,
  minLength: number = 6,
): boolean {
  if (!password || password.length < minLength) {
    return false;
  }
  return true;
}

// =====================
// TELÉFONO CHILENO
// =====================

/**
 * Valida formato de teléfono chileno
 * Acepta: +569XXXXXXXX, 09XXXXXXXX, 9XXXXXXXX
 */
export function isValidChileanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '');
  const phoneRegex = /^(\+569|9)\d{8}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Normaliza teléfono chileno al formato +569XXXXXXXX
 */
export function normalizeChileanPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '').replace('-', '');

  if (cleaned.startsWith('+569')) {
    return cleaned;
  }
  if (cleaned.startsWith('569')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('9') && cleaned.length === 9) {
    return `+56${cleaned}`;
  }
  if (cleaned.length === 8) {
    return `+56${cleaned}`;
  }

  return phone;
}
