import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncQueue } from './entities/sync-queue.entity';
import { SyncQueueService } from './services/sync-queue.service';
import { SyncQueueController } from './controllers/sync-queue.controller';
import { TypeOrmSyncQueueRepositoryAdapter } from './repositories/typeorm-sync-queue.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([SyncQueue])],
  controllers: [SyncQueueController],
  providers: [
    SyncQueueService,
    {
      provide: 'SYNC_QUEUE_REPOSITORY',
      useClass: TypeOrmSyncQueueRepositoryAdapter,
    },
  ],
  exports: [SyncQueueService],
})
export class SyncQueueModule {}
