import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merma } from '../entities/merma.entity';
import { MermaRepositoryPort } from './merma.repository.port';

@Injectable()
export class TypeOrmMermaRepositoryAdapter implements MermaRepositoryPort {
  constructor(
    @InjectRepository(Merma)
    private readonly repo: Repository<Merma>,
  ) {}

  async findAll(tenantId: string): Promise<Merma[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['reportedBy', 'ticket', 'machine'],
      order: { mermaDate: 'DESC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<Merma | null> {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    return this.repo.findOne({
      where,
      relations: ['reportedBy', 'ticket', 'machine'],
    });
  }

  async create(merma: Partial<Merma>): Promise<Merma> {
    const newMerma = this.repo.create(merma);
    return this.repo.save(newMerma);
  }

  async save(merma: Merma): Promise<Merma> {
    return this.repo.save(merma);
  }

  async softRemove(merma: Merma): Promise<void> {
    await this.repo.softRemove(merma);
  }

  async getStats(tenantId: string): Promise<any> {
    return this.repo
      .createQueryBuilder('merma')
      .select('SUM(merma.total_cost)', 'totalLoss')
      .addSelect('COUNT(*)', 'totalMermas')
      .addSelect('SUM(merma.quantity)', 'totalQuantity')
      .where('merma.tenant_id = :tenantId', { tenantId })
      .getRawOne();
  }

  async getStatsByProduct(tenantId: string): Promise<any[]> {
    return this.repo
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
}
