// services/nfc-tags.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { NfcTag } from '../entities/nfc-tag.entity';
import { CreateNfcTagDto } from '../dto/nfc-tag.dto';
import { NfcTagRepositoryPort } from '../repositories/nfc-tag.repository.port';

@Injectable()
export class NfcTagsService {
  constructor(
    @Inject('NFC_TAG_REPOSITORY')
    private readonly nfcTagRepository: NfcTagRepositoryPort,
  ) {}

  async create(createNfcTagDto: CreateNfcTagDto): Promise<NfcTag> {
    const existingTag = await this.nfcTagRepository.findByUid(
      createNfcTagDto.uid,
    );
    if (existingTag) {
      throw new BadRequestException(
        'NFC tag with this UID already exists. Possible cloning detected.',
      );
    }

    const nfcTagData = {
      uid: createNfcTagDto.uid,
      tagModel: createNfcTagDto.tagModel || 'NTAG-215',
      machineSerialId:
        createNfcTagDto.machineSerialId ||
        `SID-${createNfcTagDto.uid.substring(0, 8)}`,
      tenantName: createNfcTagDto.tenantName || 'Tenant',
      integrityChecksum:
        createNfcTagDto.integrityChecksum ||
        this.generateChecksum(createNfcTagDto.uid),
      tenant: { id: createNfcTagDto.tenantId } as any,
      machine: { id: createNfcTagDto.machineId } as any,
    };

    return this.nfcTagRepository.create(nfcTagData);
  }

  private generateChecksum(uid: string): string {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
      const char = uid.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 16);
  }

  async findByUid(uid: string, tenantId?: string): Promise<NfcTag> {
    const nfcTag = await this.nfcTagRepository.findByUid(uid, tenantId);
    if (!nfcTag) {
      throw new NotFoundException(`NFC tag with UID ${uid} not found`);
    }
    return nfcTag;
  }

  async findByMachineId(machineId: string, tenantId?: string): Promise<NfcTag> {
    const nfcTag = await this.nfcTagRepository.findByMachineId(
      machineId,
      tenantId,
    );
    if (!nfcTag) {
      throw new NotFoundException(`NFC tag for machine ${machineId} not found`);
    }
    return nfcTag;
  }

  async findAll(tenantId: string, isActive?: boolean): Promise<NfcTag[]> {
    return this.nfcTagRepository.findAll(tenantId, isActive);
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

  async validateIntegrity(
    uid: string,
    checksum: string,
    tenantId?: string,
  ): Promise<boolean> {
    const nfcTag = await this.findByUid(uid, tenantId);
    return nfcTag.integrityChecksum === checksum;
  }
}
