export class MachineModel {
  constructor(
    public readonly id: string,
    public tenantId: string,
    public assignedUserId: string | null,
    public storeId: string | null,
    public name: string | null,
    public latitude: number | null,
    public longitude: number | null,
    public brand: string | null,
    public model: string | null,
    public serialNumber: string | null,
    public status: string | null,
    public acquisitionType: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  // Comportamientos de Dominio / Reglas de Negocio incrustadas
  public markAsOutOfService(): void {
    this.isActive = false;
    this.status = 'OUT_OF_SERVICE';
    this.updatedAt = new Date();
  }

  public assignToStore(storeId: string): void {
    this.storeId = storeId;
    this.updatedAt = new Date();
  }
}
