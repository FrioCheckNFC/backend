import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Sale } from '../entities/sale.entity';
import { CreateSaleDto, UpdateSaleDto } from '../dto/sale.dto';
import { SalesRepositoryPort } from '../repositories/sales.repository.port';

@Injectable()
export class SalesService {
  constructor(
    @Inject('SALES_REPOSITORY')
    private readonly salesRepository: SalesRepositoryPort,
  ) {}

  async create(dto: CreateSaleDto, tenantId: string): Promise<Sale> {
    const sale = await this.salesRepository.create({
      ...dto,
      tenantId,
      saleDate: dto.saleDate ? new Date(dto.saleDate) : new Date(),
    });
    return this.salesRepository.save(sale);
  }

  async findAll(tenantId: string): Promise<Sale[]> {
    return this.salesRepository.findAll(tenantId);
  }

  async findOne(id: string, tenantId: string): Promise<Sale> {
    const sale = await this.salesRepository.findOne(id, tenantId);
    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }
    return sale;
  }

  async update(id: string, dto: UpdateSaleDto, tenantId: string): Promise<Sale> {
    const sale = await this.findOne(id, tenantId);
    Object.assign(sale, dto);
    if (dto.saleDate) sale.saleDate = new Date(dto.saleDate);
    return this.salesRepository.save(sale);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const sale = await this.findOne(id, tenantId);
    await this.salesRepository.softRemove(sale);
  }
}
