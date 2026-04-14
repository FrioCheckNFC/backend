import { NfcTag } from '../entities/nfc-tag.entity';

export interface NfcTagRepositoryPort {
  findByUid(uid: string, tenantId?: string): Promise<NfcTag | null>;
  findByMachineId(machineId: string, tenantId?: string): Promise<NfcTag | null>;
  findByMachineIdOrSerial(machineIdOrSerial: string, tenantId: string): Promise<NfcTag | null>;
  findAll(tenantId: string, isActive?: boolean): Promise<NfcTag[]>;
  create(tag: Partial<NfcTag>): Promise<NfcTag>;
  save(tag: NfcTag): Promise<NfcTag>;
}
