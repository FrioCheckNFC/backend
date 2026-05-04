export class UserModel {
  id: string;
  tenantId: string;
  email: string;
  rut: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string[];
  fcmTokens?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  get mainRole(): string {
    return this.role && this.role.length > 0 ? this.role[0] : 'TECHNICIAN';
  }
}
