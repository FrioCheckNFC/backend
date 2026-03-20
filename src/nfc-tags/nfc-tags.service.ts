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

    const nfcTag = this.nfcTagRepository.create(createNfcTagDto);
    return this.nfcTagRepository.save(nfcTag);
  }

  async findByUid(uid: string): Promise<NfcTag> {
    const nfcTag = await this.nfcTagRepository.findOne({
      where: { uid },
      relations: ['machine', 'tenant'],
    });

    if (!nfcTag) {
      throw new NotFoundException(`NFC tag with UID ${uid} not found`);
    }

    return nfcTag;
  }

  async findByMachineId(machineId: string): Promise<NfcTag> {
    const nfcTag = await this.nfcTagRepository.findOne({
      where: { machine: { id: machineId } },
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

  async lockTag(uid: string): Promise<NfcTag> {
    const nfcTag = await this.findByUid(uid);
    nfcTag.isLocked = true;
    return this.nfcTagRepository.save(nfcTag);
  }

  async deactivateTag(uid: string): Promise<NfcTag> {
    const nfcTag = await this.findByUid(uid);
    nfcTag.isActive = false;
    return this.nfcTagRepository.save(nfcTag);
  }

  // Validar integridad del tag
  async validateIntegrity(uid: string, checksum: string): Promise<boolean> {
    const nfcTag = await this.findByUid(uid);
    return nfcTag.integrityChecksum === checksum;
  }
}
