import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merma } from './entities/merma.entity';
import { MermasController } from './mermas.controller';
import { MermasService } from './mermas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Merma])],
  controllers: [MermasController],
  providers: [MermasService]
})
export class MermasModule {}

