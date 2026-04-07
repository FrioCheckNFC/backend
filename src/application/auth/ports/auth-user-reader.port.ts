export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string[];
<<<<<<< Updated upstream
  rut?: string;
  phone?: string;
=======
>>>>>>> Stashed changes
  tenantId: string;
  active: boolean;
}

export interface AuthUserReaderPort {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  getUserRoles(userId: string): Promise<string[]>;
}
