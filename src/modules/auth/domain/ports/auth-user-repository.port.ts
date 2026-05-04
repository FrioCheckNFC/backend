import { AuthUserRecord } from './auth-user-reader.port';

export interface AuthUserRepositoryPort {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findByIdentifier(identifier: string): Promise<AuthUserRecord | null>;
  findSuperAdmin(): Promise<AuthUserRecord | null>;
  create(user: Partial<AuthUserRecord>): Promise<AuthUserRecord>;
}
