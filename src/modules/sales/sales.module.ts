import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SalesService } from './services/sales.service';
import { SalesController } from './controllers/sales.controller';
import { TypeOrmSalesRepositoryAdapter } from './repositories/typeorm-sales.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Sale])],
  controllers: [SalesController],
  providers: [
    SalesService,
    {
      provide: 'SALES_REPOSITORY',
      useClass: TypeOrmSalesRepositoryAdapter,
    },
  ],
  exports: [SalesService, 'SALES_REPOSITORY'],
})
export class SalesModule {}

