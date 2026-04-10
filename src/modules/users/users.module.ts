// users.module.ts
// Modulo de usuarios refactorizado.

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { TypeOrmUserRepositoryAdapter } from './repositories/typeorm-user.repository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'USER_REPOSITORY',
      useClass: TypeOrmUserRepositoryAdapter,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
