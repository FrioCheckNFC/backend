import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { StoresService } from './services/stores.service';
import { StoresController } from './controllers/stores.controller';
import { StoreRepositoryPort } from './repositories/store.repository.port';
import { TypeOrmStoreRepositoryAdapter } from './repositories/typeorm-store.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  controllers: [StoresController],
  providers: [
    StoresService,
    {
      provide: StoreRepositoryPort,
      useClass: TypeOrmStoreRepositoryAdapter,
    },
  ],
  exports: [StoresService],
})
export class StoresModule {}
