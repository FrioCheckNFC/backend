import { Injectable, Inject } from '@nestjs/common';
import { MachineRepositoryPort } from '../../domain/repositories/machine.repository.port';
import { MachineModel } from '../../domain/models/machine.model';

@Injectable()
export class FindAllMachinesUseCase {
  constructor(
    @Inject('MACHINE_REPOSITORY')
    private readonly machinesRepo: MachineRepositoryPort,
  ) {}

  async execute(tenantId: string): Promise<MachineModel[]> {
    return this.machinesRepo.findAll(tenantId);
  }
}
