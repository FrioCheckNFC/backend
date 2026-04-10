import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { AttachmentsService } from './services/attachments.service';
import { AttachmentsController } from './controllers/attachments.controller';
import { TypeOrmAttachmentRepositoryAdapter } from './repositories/typeorm-attachment.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment])],
  controllers: [AttachmentsController],
  providers: [
    AttachmentsService,
    {
      provide: 'ATTACHMENT_REPOSITORY',
      useClass: TypeOrmAttachmentRepositoryAdapter,
    },
  ],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
