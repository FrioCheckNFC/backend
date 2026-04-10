import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory.entity';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { TypeOrmInventoryRepositoryAdapter } from './repositories/typeorm-inventory.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem])],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    {
      provide: 'INVENTORY_REPOSITORY',
      useClass: TypeOrmInventoryRepositoryAdapter,
    },
  ],
  exports: [InventoryService, 'INVENTORY_REPOSITORY'],
})
export class InventoryModule {}

