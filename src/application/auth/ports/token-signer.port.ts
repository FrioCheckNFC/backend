export interface TokenPayload {
  sub: string;
  email: string;
  role: string | string[];
  roles?: string[]; // Compatibilidad App movil
  tenantId: string;
}

export interface TokenSignerPort {
  sign(payload: TokenPayload): string;
}
