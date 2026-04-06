// Constantes compartidas del proyecto
// Evita duplicación de magic numbers y valores hardcodeados

// =====================
// ROLES DE USUARIO
// =====================
export const USER_ROLES = [
  'ADMIN',
  'SUPPORT',
  'VENDOR',
  'RETAILER',
  'TECHNICIAN',
  'DRIVER',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const DEFAULT_ROLE: UserRole = 'TECHNICIAN';

// =====================
// SEGURIDAD
// =====================
export const BCRYPT_SALT_ROUNDS = 10;

export const JWT_EXPIRY = '24h';

export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

// =====================
// VALIDACIÓN
// =====================
export const PASSWORD_MIN_LENGTH = 6;

export const RUT_LENGTH_MIN = 7;
export const RUT_LENGTH_MAX = 8;

// =====================
// GPS / NFC
// =====================
export const GPS_VALIDATION_RADIUS_METERS = 100;

// =====================
// PAGINACIÓN
// =====================
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// =====================
// ESTADOS
// =====================
export const MACHINE_STATUSES = [
  'OPERATIVE',
  'MAINTENANCE',
  'OUT_OF_SERVICE',
  'PENDING_INSTALL',
  'INACTIVE',
] as const;

export const VISIT_STATUSES = ['PENDING', 'COMPLETED', 'FLAGGED'] as const;

export const VISIT_TYPES = [
  'MAINTENANCE',
  'SALE',
  'INSPECTION',
  'DELIVERY',
] as const;

export const TICKET_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const;

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
