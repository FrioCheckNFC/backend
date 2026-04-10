import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfcTag } from './entities/nfc-tag.entity';
import { NfcTagsService } from './services/nfc-tags.service';
import { NfcTagsController } from './controllers/nfc-tags.controller';
import { TypeOrmNfcTagRepositoryAdapter } from './repositories/typeorm-nfc-tag.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([NfcTag])],
  providers: [
    NfcTagsService,
    {
      provide: 'NFC_TAG_REPOSITORY',
      useClass: TypeOrmNfcTagRepositoryAdapter,
    },
  ],
  controllers: [NfcTagsController],
  exports: [NfcTagsService, 'NFC_TAG_REPOSITORY'],
})
export class NfcTagsModule {}