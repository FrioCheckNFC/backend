import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merma } from './entities/merma.entity';
import { MermasService } from './services/mermas.service';
import { MermasController } from './controllers/mermas.controller';
import { TypeOrmMermaRepositoryAdapter } from './repositories/typeorm-merma.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Merma])],
  controllers: [MermasController],
  providers: [
    MermasService,
    {
      provide: 'MERMA_REPOSITORY',
      useClass: TypeOrmMermaRepositoryAdapter,
    },
  ],
  exports: [MermasService],
})
export class MermasModule {}

