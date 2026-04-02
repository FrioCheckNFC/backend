import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfcTag } from './entities/nfc-tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NfcTag])],
  exports: [TypeOrmModule],
})
export class NfcTagsModule {}
