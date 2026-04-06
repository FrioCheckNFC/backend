import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NfcTag } from './entities/nfc-tag.entity';
import { CreateNfcTagDto } from './dto/nfc-tag.dto';

@Injectable()
export class NfcTagsService {
  constructor(
    @InjectRepository(NfcTag)
    private readonly nfcTagRepository: Repository<NfcTag>,
  ) {}

  async create(createNfcTagDto: CreateNfcTagDto): Promise<NfcTag> {
    // Validar que el UID sea único (detecta clonaciones)
    const existingTag = await this.nfcTagRepository.findOne({
      where: { uid: createNfcTagDto.uid },
    });

    if (existingTag) {
      throw new BadRequestException(
        'NFC tag with this UID already exists. Possible cloning detected.',
      );
    }

    // Generar valores por defecto si no se proporcionan
    const nfcTagData = {
      uid: createNfcTagDto.uid,
      tagModel: createNfcTagDto.tagModel || 'NTAG-215',
      machineSerialId: createNfcTagDto.machineSerialId || `SID-${createNfcTagDto.uid.substring(0, 8)}`,
      tenantIdObfuscated: createNfcTagDto.tenantIdObfuscated || `TENANT-${createNfcTagDto.tenantId.substring(0, 8)}`,
      integrityChecksum: createNfcTagDto.integrityChecksum || this.generateChecksum(createNfcTagDto.uid),
      tenant: { id: createNfcTagDto.tenantId },
      machine: { id: createNfcTagDto.machineId },
    };

    const nfcTag = this.nfcTagRepository.create(nfcTagData);
    return this.nfcTagRepository.save(nfcTag);
  }

  private generateChecksum(uid: string): string {
    // Generar un checksum simple basado en el UID
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
      const char = uid.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 16);
  }

  async findByUid(uid: string, tenantId?: string): Promise<NfcTag> {
    const where: any = { uid };
    if (tenantId) {
      where.tenant = { id: tenantId };
    }

    const nfcTag = await this.nfcTagRepository.findOne({
      where,
      relations: ['machine', 'tenant'],
    });

    if (!nfcTag) {
      throw new NotFoundException(`NFC tag with UID ${uid} not found`);
    }

    return nfcTag;
  }

  async findByMachineId(machineId: string, tenantId?: string): Promise<NfcTag> {
    const where: any = { machine: { id: machineId } };
    if (tenantId) {
      where.tenant = { id: tenantId };
    }

    const nfcTag = await this.nfcTagRepository.findOne({
      where,
      relations: ['machine', 'tenant'],
    });

    if (!nfcTag) {
      throw new NotFoundException(`NFC tag for machine ${machineId} not found`);
    }

    return nfcTag;
  }

  async findAll(tenantId: string, isActive?: boolean): Promise<NfcTag[]> {
    const query = this.nfcTagRepository
      .createQueryBuilder('nfcTag')
      .where('nfcTag.tenant_id = :tenantId', { tenantId })
      .leftJoinAndSelect('nfcTag.machine', 'machine');

    if (isActive !== undefined) {
      query.andWhere('nfcTag.is_active = :isActive', { isActive });
    }

    return query.getMany();
  }

  async lockTag(uid: string, tenantId?: string): Promise<NfcTag> {
    const nfcTag = await this.findByUid(uid, tenantId);
    nfcTag.isLocked = true;
    return this.nfcTagRepository.save(nfcTag);
  }

  async deactivateTag(uid: string, tenantId?: string): Promise<NfcTag> {
    const nfcTag = await this.findByUid(uid, tenantId);
    nfcTag.isActive = false;
    return this.nfcTagRepository.save(nfcTag);
  }

  // Validar integridad del tag
  async validateIntegrity(uid: string, checksum: string, tenantId?: string): Promise<boolean> {
    const nfcTag = await this.findByUid(uid, tenantId);
    return nfcTag.integrityChecksum === checksum;
  }
}
