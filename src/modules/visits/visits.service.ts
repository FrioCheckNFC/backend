// visits.service.ts
// Logica de negocio para visitas de tecnicos a equipos.
// Las visitas se crean desde la app movil.
// El admin puede listar todas las visitas de su tenant.
// El tecnico solo ve sus propias visitas.

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from './entities/visit.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

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
      relations: ['technician', 'asset'],
      order: { visitedAt: 'DESC' },
    });
  }

  // Listar solo las visitas de un tecnico especifico
  async findByTechnician(technicianId: string, tenantId: string): Promise<Visit[]> {
    return this.visitsRepo.find({
      where: { technicianId, tenantId },
      relations: ['asset'],
      order: { visitedAt: 'DESC' },
    });
  }

  // Obtener una visita por ID
  async findOne(id: string, tenantId: string): Promise<Visit> {
    const visit = await this.visitsRepo.findOne({
      where: { id, tenantId },
      relations: ['technician', 'asset'],
    });
    if (!visit) {
      throw new NotFoundException('Visita no encontrada');
    }
    return visit;
  }

  // Crear una visita (la app movil manda los datos cuando el tecnico termina)
  async create(dto: CreateVisitDto, technicianId: string, tenantId: string): Promise<Visit> {
    const visit = this.visitsRepo.create({
      ...dto,
      visitedAt: new Date(dto.visitedAt),
      technicianId,
      tenantId,
    });
    return this.visitsRepo.save(visit);
  }

  // Actualizar una visita (solo correcciones)
  async update(id: string, dto: UpdateVisitDto, tenantId: string): Promise<Visit> {
    const visit = await this.findOne(id, tenantId);
    Object.assign(visit, dto);
    return this.visitsRepo.save(visit);
  }

  // Soft delete
  async remove(id: string, tenantId: string): Promise<void> {
    const visit = await this.findOne(id, tenantId);
    await this.visitsRepo.softRemove(visit);
  }
}
