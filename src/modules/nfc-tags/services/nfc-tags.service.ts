// services/nfc-tags.service.ts
import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { NfcTag } from '../entities/nfc-tag.entity';
import { CreateNfcTagDto } from '../dto/nfc-tag.dto';
import { NfcTagRepositoryPort } from '../repositories/nfc-tag.repository.port';

@Injectable()
export class NfcTagsService {
  constructor(
    @Inject('NFC_TAG_REPOSITORY')
    private readonly nfcTagRepository: NfcTagRepositoryPort,
  ) {}

  async create(createNfcTagDto: CreateNfcTagDto, tenantId: string): Promise<NfcTag> {
    const existingTag = await this.nfcTagRepository.findByUid(createNfcTagDto.uid, tenantId);
    if (existingTag) {
      throw new BadRequestException('NFC tag with this UID already exists. Possible cloning detected.');
    }

    const nfcTagData = {
      uid: createNfcTagDto.uid,
      tagModel: createNfcTagDto.tagModel || 'NTAG-215',
      tenant_id: tenantId,
      machine_id: createNfcTagDto.machineId,
    };

    return this.nfcTagRepository.create(nfcTagData);
  }

  async findByUid(uid: string, tenantId?: string): Promise<NfcTag> {
    const nfcTag = await this.nfcTagRepository.findByUid(uid, tenantId);
    if (!nfcTag) {
      throw new NotFoundException(`NFC tag with UID ${uid} not found`);
    }
    return nfcTag;
  }

  async findByMachineId(machineId: string, tenantId?: string): Promise<NfcTag> {
    const nfcTag = await this.nfcTagRepository.findByMachineId(machineId, tenantId);
    if (!nfcTag) {
      throw new NotFoundException(`NFC tag for machine ${machineId} not found`);
    }
    return nfcTag;
  }

  async findByMachineIdOrSerial(machineIdOrSerial: string, tenantId: string): Promise<NfcTag> {
    const nfcTag = await this.nfcTagRepository.findByMachineIdOrSerial(machineIdOrSerial, tenantId);
    if (!nfcTag) {
      throw new NotFoundException(`NFC tag for machine ${machineIdOrSerial} not found`);
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
}
