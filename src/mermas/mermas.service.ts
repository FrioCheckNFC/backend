import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merma } from './entities/merma.entity';
import { CreateMermaDto, UpdateMermaDto } from './dto/merma.dto';

@Injectable()
export class MermasService {
  constructor(
    @InjectRepository(Merma)
    private readonly mermaRepository: Repository<Merma>,
  ) {}

  async create(createMermaDto: CreateMermaDto): Promise<Merma> {
    const totalCost = createMermaDto.quantity * createMermaDto.unitCost;
    
    const merma = this.mermaRepository.create({
      ...createMermaDto,
      totalCost,
    });
    return this.mermaRepository.save(merma);
  }

  async findAll(tenantId: string): Promise<Merma[]> {
    return this.mermaRepository.find({
      where: { tenantId },
      relations: ['reportedBy', 'ticket', 'machine'],
      order: { mermaDate: 'DESC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<Merma> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const merma = await this.mermaRepository.findOne({
      where,
      relations: ['reportedBy', 'ticket', 'machine'],
    });
    if (!merma) {
      throw new NotFoundException(`Merma with ID ${id} not found`);
    }

    return merma;
  }

  async getStats(tenantId: string): Promise<any> {
    const result = await this.mermaRepository
      .createQueryBuilder('merma')
      .select('SUM(merma.total_cost)', 'totalLoss')
      .addSelect('COUNT(*)', 'totalMermas')
      .addSelect('SUM(merma.quantity)', 'totalQuantity')
      .where('merma.tenant_id = :tenantId', { tenantId })
      .getRawOne();

    return result;
  }

  async getStatsByProduct(tenantId: string): Promise<any> {
    return this.mermaRepository
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

  async update(id: string, updateMermaDto: UpdateMermaDto): Promise<Merma> {
    const merma = await this.findById(id);
    
    if (updateMermaDto.quantity !== undefined || updateMermaDto.unitCost !== undefined) {
      const quantity = updateMermaDto.quantity ?? merma.quantity;
      const unitCost = updateMermaDto.unitCost ?? merma.unitCost;
      updateMermaDto['totalCost'] = quantity * unitCost;
    }
    
    Object.assign(merma, updateMermaDto);
    return this.mermaRepository.save(merma);
  }

  async remove(id: string): Promise<void> {
    const merma = await this.findById(id);
    await this.mermaRepository.softRemove(merma);
  }
}
