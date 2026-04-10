import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kpi } from './entities/kpi.entity';
import { KpisService } from './services/kpis.service';
import { KpisController } from './controllers/kpis.controller';
import { TypeOrmKpiRepositoryAdapter } from './repositories/typeorm-kpi.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Kpi])],
  controllers: [KpisController],
  providers: [
    KpisService,
    {
      provide: 'KPI_REPOSITORY',
      useClass: TypeOrmKpiRepositoryAdapter,
    },
  ],
  exports: [KpisService],
})
export class KpisModule {}

