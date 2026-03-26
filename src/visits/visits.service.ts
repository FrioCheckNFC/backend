import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit, VisitStatus } from './entities/visit.entity';
import { CheckInVisitDto, CheckOutVisitDto } from './dto/visit.dto';
import { NfcTag } from '../nfc-tags/entities/nfc-tag.entity';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
    @InjectRepository(NfcTag)
    private readonly nfcTagRepository: Repository<NfcTag>,
  ) {}

  // Check-in: Abre una visita con primer escaneo NFC + GPS
  async checkIn(checkInVisitDto: CheckInVisitDto): Promise<Visit> {
    // Validar que no haya una visita abierta para este usuario+máquina
    const openVisit = await this.visitRepository.findOne({
      where: {
        user_id: checkInVisitDto.userId,
        machine_id: checkInVisitDto.machineId,
        status: VisitStatus.ABIERTA,
      },
    });

    if (openVisit) {
      throw new BadRequestException('User already has an open visit for this machine');
    }

    // Auto-registrar NFC si no existe
    const existingNfc = await this.nfcTagRepository.findOne({
      where: { uid: checkInVisitDto.checkInNfcUid },
    });

    if (!existingNfc) {
      const newNfcTag = this.nfcTagRepository.create({
        tenant_id: checkInVisitDto.tenantId,
        machine_id: checkInVisitDto.machineId,
        uid: checkInVisitDto.checkInNfcUid,
        tagModel: 'NTAG-215',
        machineSerialId: 'AUTO-REGISTERED',
        tenantIdObfuscated: checkInVisitDto.tenantId.substring(0, 8),
        integrityChecksum: `checksum-${Date.now()}`,
        isLocked: false,
        isActive: true,
      } as any);
      await this.nfcTagRepository.save(newNfcTag);
    }

    const visit = this.visitRepository.create({
      tenant_id: checkInVisitDto.tenantId,
      user_id: checkInVisitDto.userId,
      machine_id: checkInVisitDto.machineId,
      checkInNfcUid: checkInVisitDto.checkInNfcUid,
      checkInGpsLat: checkInVisitDto.checkInGpsLat,
      checkInGpsLng: checkInVisitDto.checkInGpsLng,
      checkInTimestamp: new Date(),
      status: VisitStatus.ABIERTA,
    });

    return this.visitRepository.save(visit);
  }

  // Check-out: Cierra la visita con segundo escaneo NFC + GPS obligatorio
  async checkOut(checkOutVisitDto: CheckOutVisitDto): Promise<Visit> {
    const visit = await this.visitRepository.findOne({
      where: { id: checkOutVisitDto.visitId, status: VisitStatus.ABIERTA },
    });

    if (!visit) {
      throw new NotFoundException('No open visit found');
    }

    // Validar que el NFC coincida
    const nfcMatches = visit.checkInNfcUid === checkOutVisitDto.checkOutNfcUid;

    if (!nfcMatches) {
      throw new BadRequestException(
        'NFC validation failed: Check-out NFC UID does not match check-in NFC UID. Possible fraud detected.',
      );
    }

    visit.checkOutTimestamp = new Date();
    visit.checkOutNfcUid = checkOutVisitDto.checkOutNfcUid;
    visit.checkOutGpsLat = checkOutVisitDto.checkOutGpsLat;
    visit.checkOutGpsLng = checkOutVisitDto.checkOutGpsLng;
    visit.status = VisitStatus.CERRADA;

    return this.visitRepository.save(visit);
  }

  async findById(id: string, tenantId?: string): Promise<Visit> {
    const where: any = { id };
    if (tenantId) {
      where.tenant = { id: tenantId };
    }

    const visit = await this.visitRepository.findOne({
      where,
      relations: ['user', 'machine', 'tenant', 'attachments'],
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    return visit;
  }

  async findByUser(userId: string, tenantId: string): Promise<Visit[]> {
    return this.visitRepository.find({
      where: {
        user: { id: userId },
        tenant: { id: tenantId },
      },
      relations: ['machine', 'attachments'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOpenVisits(tenantId: string): Promise<Visit[]> {
    return this.visitRepository.find({
      where: {
        tenant: { id: tenantId },
        status: VisitStatus.ABIERTA,
      },
      relations: ['user', 'machine'],
      order: { checkInTimestamp: 'DESC' },
    });
  }

  // Calcula duración de la visita
  getVisitDuration(visit: Visit): number | null {
    if (!visit.checkOutTimestamp) return null;
    return Math.floor(
      (visit.checkOutTimestamp.getTime() - visit.checkInTimestamp.getTime()) / 1000
    ); // en segundos
  }
}
