import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Visit } from '../entities/visit.entity';
import { CreateVisitDto } from '../dto/create-visit.dto';
import { UpdateVisitDto } from '../dto/update-visit.dto';
import { VisitActionDto } from '../dto/visit-action.dto';
import { VisitRepositoryPort } from '../repositories/visit.repository.port';

@Injectable()
export class VisitsService {
  constructor(
    @Inject('VISIT_REPOSITORY')
    private readonly visitRepository: VisitRepositoryPort,
  ) {}

  async findAll(tenantId: string): Promise<Visit[]> {
    return this.visitRepository.findAll(tenantId);
  }

  async findByTechnician(
    technicianId: string,
    tenantId: string,
  ): Promise<Visit[]> {
    return this.visitRepository.findByTechnician(technicianId, tenantId);
  }

  async findOne(id: string, tenantId: string): Promise<Visit> {
    const visit = await this.visitRepository.findOne(id, tenantId);
    if (!visit) {
      throw new NotFoundException('Visita no encontrada');
    }
    return visit;
  }

  async create(
    dto: CreateVisitDto,
    technicianId: string,
    tenantId: string,
  ): Promise<Visit> {
    return this.visitRepository.create({
      ...dto,
      visitedAt: new Date(dto.visitedAt),
      technicianId,
      tenantId,
    });
  }

  async update(
    id: string,
    dto: UpdateVisitDto,
    tenantId: string,
    requesterId: string,
    requesterRoles: string[],
  ): Promise<Visit> {
    const visit = await this.findOne(id, tenantId);

    if (
      !requesterRoles.includes('ADMIN') &&
      visit.technicianId !== requesterId
    ) {
      throw new BadRequestException('No tienes permiso para editar esta visita');
    }

    Object.assign(visit, dto);
    return this.visitRepository.save(visit);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const visit = await this.findOne(id, tenantId);
    await this.visitRepository.softRemove(visit);
  }

  async checkIn(
    dto: VisitActionDto,
    userId: string,
    tenantId: string,
  ): Promise<Visit> {
    const openVisit = await this.visitRepository.findPending(userId, dto.machineId);

    if (openVisit) {
      throw new BadRequestException(
        'Ya tienes una visita abierta para esta máquina',
      );
    }

    return this.visitRepository.create({
      tenantId,
      technicianId: userId,
      machineId: dto.machineId,
      nfcTagId: dto.nfcUid,
      latitude: dto.latitude,
      longitude: dto.longitude,
      status: 'pending',
      visitedAt: new Date(),
    });
  }

  async checkOut(
    visitId: string,
    dto: Omit<VisitActionDto, 'machineId'>,
    userId: string,
    tenantId: string,
  ): Promise<Visit> {
    const visit = await this.visitRepository.findOne(visitId, tenantId);

    if (!visit || visit.status !== 'pending') {
      throw new NotFoundException('No se encontró visita abierta con ese ID');
    }

    if (visit.nfcTagId !== dto.nfcUid) {
      throw new BadRequestException(
        'Validación NFC fallida: el tag no coincide con el del Check-In. Posible fraude.',
      );
    }

    visit.status = 'completed';
    return this.visitRepository.save(visit);
  }
}
