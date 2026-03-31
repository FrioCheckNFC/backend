import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto, UpdateSaleDto } from './dto/sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const sale = this.saleRepository.create(createSaleDto);
    return this.saleRepository.save(sale);
  }

  async findAll(tenantId: string): Promise<Sale[]> {
    return this.saleRepository.find({
      where: { tenantId },
      relations: ['vendor', 'sector', 'machine'],
      order: { saleDate: 'DESC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<Sale> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const sale = await this.saleRepository.findOne({
      where,
      relations: ['vendor', 'sector', 'machine'],
    });
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async findByVendor(vendorId: string, tenantId: string): Promise<Sale[]> {
    return this.saleRepository.find({
      where: { vendorId, tenantId },
      relations: ['sector', 'machine'],
      order: { saleDate: 'DESC' },
    });
  }

  async findBySector(sectorId: string, tenantId: string): Promise<Sale[]> {
    return this.saleRepository.find({
      where: { sectorId, tenantId },
      relations: ['vendor', 'machine'],
      order: { saleDate: 'DESC' },
    });
  }

  async getMetricsByVendor(tenantId: string): Promise<any> {
    return this.saleRepository
      .createQueryBuilder('sale')
      .select('sale.vendor_id', 'vendorId')
      .addSelect('SUM(sale.amount)', 'totalAmount')
      .addSelect('COUNT(*)', 'totalSales')
      .where('sale.tenant_id = :tenantId', { tenantId })
      .groupBy('sale.vendor_id')
      .getRawMany();
  }

  async getMetricsBySector(tenantId: string): Promise<any> {
    return this.saleRepository
      .createQueryBuilder('sale')
      .select('sale.sector_id', 'sectorId')
      .addSelect('SUM(sale.amount)', 'totalAmount')
      .addSelect('COUNT(*)', 'totalSales')
      .where('sale.tenant_id = :tenantId', { tenantId })
      .groupBy('sale.sector_id')
      .getRawMany();
  }

  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.findById(id);
    Object.assign(sale, updateSaleDto);
    return this.saleRepository.save(sale);
  }

  async remove(id: string): Promise<void> {
    const sale = await this.findById(id);
    await this.saleRepository.softRemove(sale);
  }
}
