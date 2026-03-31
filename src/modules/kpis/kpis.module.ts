import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kpi } from './entities/kpi.entity';
import { KpisController } from './kpis.controller';
import { KpisService } from './kpis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Kpi])],
  controllers: [KpisController],
  providers: [KpisService]
})
export class KpisModule {}

