// visits.service.ts
// Logica de negocio para visitas de tecnicos a equipos.
// Las visitas se crean desde la app movil.
// El admin puede listar todas las visitas de su tenant.
// El tecnico solo ve sus propias visitas.

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from './entities/visit.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { VisitActionDto } from './dto/visit-action.dto';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitsRepo: Repository<Visit>,
  ) {}

  // Listar todas las visitas del tenant (para admin/dashboard)
  async findAll(tenantId: string): Promise<Visit[]> {
    return this.visitsRepo.find({
      where: { tenantId },
      relations: ['technician', 'machine'],
      order: { visitedAt: 'DESC' },
    });
  }

  // Listar solo las visitas de un tecnico especifico
  async findByTechnician(
    technicianId: string,
    tenantId: string,
  ): Promise<Visit[]> {
    return this.visitsRepo.find({
      where: { technicianId, tenantId },
      relations: ['machine'],
      order: { visitedAt: 'DESC' },
    });
  }

  // Obtener una visita por ID
  async findOne(id: string, tenantId: string): Promise<Visit> {
    const visit = await this.visitsRepo.findOne({
      where: { id, tenantId },
      relations: ['technician', 'machine'],
    });
    if (!visit) {
      throw new NotFoundException('Visita no encontrada');
    }
    return visit;
  }

  // Crear una visita (la app movil manda los datos cuando el tecnico termina)
  async create(
    dto: CreateVisitDto,
    technicianId: string,
    tenantId: string,
  ): Promise<Visit> {
    const visit = this.visitsRepo.create({
      ...dto,
      visitedAt: new Date(dto.visitedAt),
      technicianId,
      tenantId,
    });
    return this.visitsRepo.save(visit);
  }

  // Actualizar una visita
  // FIX #6: si el usuario es TECHNICIAN, solo puede editar SUS propias visitas
  async update(
    id: string,
    dto: UpdateVisitDto,
    tenantId: string,
    requesterId: string,
    requesterRoles: string[],
  ): Promise<Visit> {
    const visit = await this.findOne(id, tenantId);

    // Admin puede editar cualquier visita del tenant
    // Tecnico solo puede editar las suyas
    if (
      !requesterRoles.includes('ADMIN') &&
      visit.technicianId !== requesterId
    ) {
      throw new Error('No tienes permiso para editar esta visita');
    }

    Object.assign(visit, dto);
    return this.visitsRepo.save(visit);
  }

  // Soft delete
  async remove(id: string, tenantId: string): Promise<void> {
    const visit = await this.findOne(id, tenantId);
    await this.visitsRepo.softRemove(visit);
  }

  // Check-In (Abre visita)
  async checkIn(
    dto: VisitActionDto,
    userId: string,
    tenantId: string,
  ): Promise<Visit> {
    const openVisit = await this.visitsRepo.findOne({
      where: {
        technicianId: userId,
        machineId: dto.machineId,
        status: 'pending',
      },
    });

    if (openVisit) {
      throw new BadRequestException(
        'Ya tienes una visita abierta para esta máquina',
      );
    }

    const visit = this.visitsRepo.create({
      tenantId,
      technicianId: userId,
      machineId: dto.machineId,
      nfcTagId: dto.nfcUid,
      latitude: dto.latitude,
      longitude: dto.longitude,
      status: 'pending',
      visitedAt: new Date(),
    });

    return this.visitsRepo.save(visit);
  }

  // Check-Out (Cierra visita)
  async checkOut(
    visitId: string,
    dto: Omit<VisitActionDto, 'machineId'>,
    userId: string,
    tenantId: string,
  ): Promise<Visit> {
    const visit = await this.visitsRepo.findOne({
      where: { id: visitId, status: 'pending', tenantId },
    });

    if (!visit) {
      throw new NotFoundException('No se encontró visita abierta con ese ID');
    }

    if (visit.nfcTagId !== dto.nfcUid) {
      throw new BadRequestException(
        'Validación NFC fallida: el tag no coincide con el del Check-In. Posible fraude.',
      );
    }

    visit.status = 'completed';
    return this.visitsRepo.save(visit);
  }
}
