import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visit } from './entities/visit.entity';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Visit])],
  providers: [VisitsService],
  controllers: [VisitsController],
  exports: [VisitsService, TypeOrmModule],
})
export class VisitsModule {}
