import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MachineTypeOrmEntity } from '../entities/machine.typeorm.entity';
import { MachineRepositoryPort } from '../../../domain/repositories/machine.repository.port';
import { MachineModel } from '../../../domain/models/machine.model';
import { MachineMapper } from '../mappers/machine.mapper';
// Note: In real strict DDD we would have a separate interface for fetching cross-module things like visits,
// or we make sure Visit entity uses raw queries. For now, since this is a pilot, we keep the raw query structure.

@Injectable()
export class MachineTypeOrmRepository implements MachineRepositoryPort {
  constructor(
    @InjectRepository(MachineTypeOrmEntity)
    private readonly repo: Repository<MachineTypeOrmEntity>,
  ) {}

  async findAll(tenantId: string): Promise<MachineModel[]> {
    const records = await this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return records.map(MachineMapper.toDomain);
  }

  async findOne(identifier: string, tenantId: string): Promise<MachineModel | null> {
    const query = this.repo.createQueryBuilder('machine')
      .where('machine.tenant_id = :tenantId', { tenantId });

    if (this.isUUID(identifier)) {
      query.andWhere('(machine.id::text = :identifier OR machine.serial_number = :identifier)', { identifier });
    } else {
      query.andWhere('machine.serial_number = :identifier', { identifier });
    }

    const record = await query.getOne();
    return record ? MachineMapper.toDomain(record) : null;
  }

  async findById(id: string, tenantId: string): Promise<MachineModel | null> {
    const record = await this.repo.findOne({
      where: { id, tenantId },
    });
    return record ? MachineMapper.toDomain(record) : null;
  }

  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  async create(machinePartial: Partial<MachineModel>): Promise<MachineModel> {
    // Para simplificar: tomamos lo provisto, creamos la entidad TypeORM, guardamos y devolvemos dominio
    const toSave = this.repo.create(machinePartial as any); // cast for simplicity inside adapter
    const saved = await this.repo.save(toSave);
    return MachineMapper.toDomain(saved as any);
  }

  async save(machine: MachineModel): Promise<MachineModel> {
    const typeOrmEntity = MachineMapper.toPersistence(machine);
    const saved = await this.repo.save(typeOrmEntity);
    return MachineMapper.toDomain(saved);
  }

  async softRemove(machine: MachineModel): Promise<void> {
    const typeOrmEntity = MachineMapper.toPersistence(machine);
    await this.repo.softRemove(typeOrmEntity);
  }

  // Cross-Aggregate Queries (Usually shifted to CQRS read models or distinct Repositories in huge apps)
  async getLastControlDetails(machineId: string, tenantId: string): Promise<any> {
    const result = await this.repo.manager.query(
      `
      SELECT v.visited_at, v.status, v.notes, u.first_name, u.last_name 
      FROM visits v
      LEFT JOIN users u ON v.technician_id = u.id
      WHERE v.machine_id = $1 AND v.tenant_id = $2
      ORDER BY v.visited_at DESC
      LIMIT 1
      `, [machineId, tenantId]
    );

    if (!result || result.length === 0) return null;
    const lastVisit = result[0];

    return {
      date: lastVisit.visited_at,
      status: lastVisit.status,
      userName: `${lastVisit.first_name || ''} ${lastVisit.last_name || ''}`.trim(),
      summary: lastVisit.notes,
    };
  }

  async getRecentVisits(machineId: string, tenantId: string, limit: number): Promise<any[]> {
    const result = await this.repo.manager.query(
      `
      SELECT v.id, v.visited_at, v.status, u.first_name, u.last_name, u.role
      FROM visits v
      LEFT JOIN users u ON v.technician_id = u.id
      WHERE v.machine_id = $1 AND v.tenant_id = $2
      ORDER BY v.visited_at DESC
      LIMIT $3
      `, [machineId, tenantId, limit]
    );

    return result.map((row: any) => {
      let role = null;
      try { role = row.role ? JSON.parse(row.role)[0] : null; } catch (e) {}

      return {
        id: row.id,
        date: row.visited_at,
        status: row.status,
        userName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        userRole: role,
      };
    });
  }
}
