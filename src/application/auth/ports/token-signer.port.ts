export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface TokenSignerPort {
  sign(payload: TokenPayload): string;
}
