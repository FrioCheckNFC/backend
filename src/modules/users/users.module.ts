import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserTypeOrmEntity } from './infrastructure/database/entities/user.typeorm.entity';
import { TypeormUserRepositoryAdapter } from './infrastructure/database/repositories/typeorm-user.repository.adapter';

import { UsersController } from './infrastructure/http/controllers/users.controller';

import { FindUsersUseCase } from './application/use-cases/find-users.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { RemoveUserUseCase } from './application/use-cases/remove-user.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { ManageRolesUseCase } from './application/use-cases/manage-roles.use-case';

const useCases = [
  FindUsersUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  RemoveUserUseCase,
  ChangePasswordUseCase,
  ManageRolesUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeOrmEntity])],
  controllers: [UsersController],
  providers: [
    ...useCases,
    {
      provide: 'USER_REPOSITORY',
      useClass: TypeormUserRepositoryAdapter,
    },
  ],
  exports: [
    ...useCases,
    'USER_REPOSITORY',
  ],
})
export class UsersModule {}
