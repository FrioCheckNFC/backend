export interface TokenPayload {
  sub: string;
  email: string;
  role: string[];
  roles?: string[]; // Compatibilidad App movil
  tenantId: string;
}

export interface TokenSignerPort {
  sign(payload: TokenPayload): string;
}
