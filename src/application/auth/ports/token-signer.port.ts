export interface TokenPayload {
  sub: string;
  email: string;
  role: string[];
<<<<<<< Updated upstream
=======
  roles?: string[]; // Compatibilidad App movil
>>>>>>> Stashed changes
  tenantId: string;
}

export interface TokenSignerPort {
  sign(payload: TokenPayload): string;
}
