import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Merma } from '../entities/merma.entity';
import { CreateMermaDto, UpdateMermaDto } from '../dto/merma.dto';
import { MermaRepositoryPort } from '../repositories/merma.repository.port';

@Injectable()
export class MermasService {
  constructor(
    @Inject('MERMA_REPOSITORY')
    private readonly mermaRepository: MermaRepositoryPort,
  ) {}

  async create(dto: CreateMermaDto, tenantId: string): Promise<Merma> {
    const totalCost = dto.quantity * dto.unitCost;
    const merma = await this.mermaRepository.create({ ...dto, totalCost, tenantId });
    return this.mermaRepository.save(merma);
  }

  async findAll(tenantId: string): Promise<Merma[]> {
    return this.mermaRepository.findAll(tenantId);
  }

  async findById(id: string, tenantId?: string): Promise<Merma> {
    const merma = await this.mermaRepository.findById(id, tenantId);
    if (!merma) {
      throw new NotFoundException(`Merma con ID ${id} no encontrada`);
    }
    return merma;
  }

  async getStats(tenantId: string): Promise<any> {
    return this.mermaRepository.getStats(tenantId);
  }

  async getStatsByProduct(tenantId: string): Promise<any[]> {
    return this.mermaRepository.getStatsByProduct(tenantId);
  }

  async update(id: string, dto: UpdateMermaDto, tenantId: string): Promise<Merma> {
    const merma = await this.findById(id, tenantId);
    
    // Recalcular totalCost si cambian cantidad o costo unitario
    if (dto.quantity !== undefined || dto.unitCost !== undefined) {
      const quantity = dto.quantity ?? merma.quantity;
      const unitCost = dto.unitCost ?? merma.unitCost;
      (merma as any).totalCost = quantity * unitCost;
    }
    
    Object.assign(merma, dto);
    return this.mermaRepository.save(merma);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const merma = await this.findById(id, tenantId);
    await this.mermaRepository.softRemove(merma);
  }
}
