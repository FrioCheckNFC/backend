import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sector } from './entities/sector.entity';
import { SectorsController } from './controllers/sectors.controller';
import { SectorsService } from './services/sectors.service';
import { TypeOrmSectorRepositoryAdapter } from './repositories/typeorm-sector.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Sector])],
  controllers: [SectorsController],
  providers: [
    SectorsService,
    {
      provide: 'SECTOR_REPOSITORY',
      useClass: TypeOrmSectorRepositoryAdapter,
    },
  ],
  exports: [SectorsService],
})
export class SectorsModule {}

