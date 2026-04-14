import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NfcTag } from '../entities/nfc-tag.entity';
import { NfcTagRepositoryPort } from './nfc-tag.repository.port';

@Injectable()
export class TypeOrmNfcTagRepositoryAdapter implements NfcTagRepositoryPort {
  constructor(
    @InjectRepository(NfcTag)
    private readonly repo: Repository<Repository<NfcTag>>,
  ) {}

  async findByUid(uid: string, tenantId?: string): Promise<NfcTag | null> {
    const cleanUid = uid.replace(/[-\s]/g, '').toUpperCase();
    
    const query = (this.repo as any).createQueryBuilder('nfcTag')
      .leftJoinAndSelect('nfcTag.machine', 'machine')
      .leftJoinAndSelect('nfcTag.tenant', 'tenant')
      .where('REPLACE(nfcTag.uid, :dash, :empty) = :cleanUid', { 
        cleanUid, 
        dash: '-', 
        empty: '' 
      });

    if (tenantId) {
      query.andWhere('nfcTag.tenant_id = :tenantId', { tenantId });
    }

    return query.getOne();
  }

  async findByMachineId(machineId: string, tenantId?: string): Promise<NfcTag | null> {
    const where: any = { machine: { id: machineId } };
    if (tenantId) where.tenant = { id: tenantId };
    return (this.repo as any).findOne({ where, relations: ['machine', 'tenant'] });
  }

  async findByMachineIdOrSerial(machineIdOrSerial: string, tenantId: string): Promise<NfcTag | null> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(machineIdOrSerial);
    
    const query = (this.repo as any).createQueryBuilder('nfcTag')
      .where('nfcTag.tenant_id = :tenantId', { tenantId })
      .leftJoinAndSelect('nfcTag.machine', 'machine');

    if (isUUID) {
      query.andWhere('(machine.id = :id OR machine.serial_number = :serial)', { 
        id: machineIdOrSerial, 
        serial: machineIdOrSerial 
      });
    } else {
      query.andWhere('machine.serial_number = :serial', { serial: machineIdOrSerial });
    }

    return query.getOne();
  }

  async findAll(tenantId: string, isActive?: boolean): Promise<NfcTag[]> {
    const query = (this.repo as any).createQueryBuilder('nfcTag')
      .where('nfcTag.tenant_id = :tenantId', { tenantId })
      .leftJoinAndSelect('nfcTag.machine', 'machine');

    if (isActive !== undefined) {
      query.andWhere('nfcTag.is_active = :isActive', { isActive });
    }

    return query.getMany();
  }

  async create(tag: Partial<NfcTag>): Promise<NfcTag> {
    const newTag = (this.repo as any).create(tag);
    return (this.repo as any).save(newTag);
  }

  async save(tag: NfcTag): Promise<NfcTag> {
    return (this.repo as any).save(tag);
  }
}
