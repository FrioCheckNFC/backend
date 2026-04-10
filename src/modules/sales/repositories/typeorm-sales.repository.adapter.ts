import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { SalesRepositoryPort } from './sales.repository.port';

@Injectable()
export class TypeOrmSalesRepositoryAdapter implements SalesRepositoryPort {
  constructor(
    @InjectRepository(Sale)
    private readonly repo: Repository<Sale>,
  ) {}

  async findAll(tenantId: string): Promise<Sale[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['machine'],
      order: { saleDate: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Sale | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: ['machine'],
    });
  }

  async create(sale: Partial<Sale>): Promise<Sale> {
    const newSale = this.repo.create(sale);
    return this.repo.save(newSale);
  }

  async save(sale: Sale): Promise<Sale> {
    return this.repo.save(sale);
  }

  async softRemove(sale: Sale): Promise<void> {
    await this.repo.softRemove(sale);
  }
}
