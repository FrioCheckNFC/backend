import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncQueue } from './entities/sync-queue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncQueue])],
  exports: [TypeOrmModule],
})
export class SyncQueueModule {}
