import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merma } from './entities/merma.entity';
import { CreateMermaDto, UpdateMermaDto } from './dto/merma.dto';

@Injectable()
export class MermasService {
  constructor(
    @InjectRepository(Merma)
    private readonly mermaRepo: Repository<Merma>,
  ) {}

  async create(dto: CreateMermaDto, tenantId: string): Promise<any> {
    const totalCost = dto.quantity * dto.unitCost;
    const merma = this.mermaRepo.create({ ...dto, totalCost, tenantId } as any);
    return this.mermaRepo.save(merma);
  }

  async findAll(tenantId: string): Promise<any[]> {
    return this.mermaRepo.find({
      where: { tenantId },
      relations: ['reportedBy', 'ticket', 'machine'],
      order: { mermaDate: 'DESC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<any> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const merma = await this.mermaRepo.findOne({
      where,
      relations: ['reportedBy', 'ticket', 'machine'],
    });
    if (!merma) throw new NotFoundException(`Merma con ID ${id} no encontrada`);
    return merma;
  }

  async getStats(tenantId: string): Promise<any> {
    return this.mermaRepo
      .createQueryBuilder('merma')
      .select('SUM(merma.total_cost)', 'totalLoss')
      .addSelect('COUNT(*)', 'totalMermas')
      .addSelect('SUM(merma.quantity)', 'totalQuantity')
      .where('merma.tenant_id = :tenantId', { tenantId })
      .getRawOne();
  }

  async getStatsByProduct(tenantId: string): Promise<any> {
    return this.mermaRepo
      .createQueryBuilder('merma')
      .select('merma.product_name', 'productName')
      .addSelect('SUM(merma.total_cost)', 'totalLoss')
      .addSelect('SUM(merma.quantity)', 'totalQuantity')
      .addSelect('COUNT(*)', 'totalMermas')
      .where('merma.tenant_id = :tenantId', { tenantId })
      .groupBy('merma.product_name')
      .orderBy('totalLoss', 'DESC')
      .getRawMany();
  }

  async update(id: string, dto: UpdateMermaDto): Promise<any> {
    const merma = await this.findById(id);
    if (dto.quantity !== undefined || dto.unitCost !== undefined) {
      const quantity = dto.quantity ?? merma.quantity;
      const unitCost = dto.unitCost ?? merma.unitCost;
      (dto as any).totalCost = quantity * unitCost;
    }
    Object.assign(merma, dto);
    return this.mermaRepo.save(merma);
  }

  async remove(id: string): Promise<void> {
    const merma = await this.findById(id);
    await this.mermaRepo.softRemove(merma);
  }
}

