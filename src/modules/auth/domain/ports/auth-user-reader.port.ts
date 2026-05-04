export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string[];
  rut?: string;
  phone?: string;
  tenantId: string;
  active: boolean;
}

export interface AuthUserReaderPort {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
}
