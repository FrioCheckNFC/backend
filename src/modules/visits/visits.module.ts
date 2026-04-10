import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visit } from './entities/visit.entity';
import { VisitsService } from './services/visits.service';
import { VisitsController } from './controllers/visits.controller';
import { TypeOrmVisitRepositoryAdapter } from './repositories/typeorm-visit.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Visit])],
  controllers: [VisitsController],
  providers: [
    VisitsService,
    {
      provide: 'VISIT_REPOSITORY',
      useClass: TypeOrmVisitRepositoryAdapter,
    },
  ],
  exports: [VisitsService, 'VISIT_REPOSITORY'],
})
export class VisitsModule {}
