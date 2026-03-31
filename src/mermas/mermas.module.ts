import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merma } from './entities/merma.entity';
import { MermasService } from './mermas.service';
import { MermasController } from './mermas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Merma])],
  controllers: [MermasController],
  providers: [MermasService],
  exports: [MermasService],
})
export class MermasModule {}
