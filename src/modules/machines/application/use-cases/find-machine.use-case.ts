import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { MachineRepositoryPort } from '../../domain/repositories/machine.repository.port';
import { MachineModel } from '../../domain/models/machine.model';

@Injectable()
export class FindMachineUseCase {
  constructor(
    @Inject('MACHINE_REPOSITORY')
    private readonly machinesRepo: MachineRepositoryPort,
  ) {}

  async execute(id: string, tenantId: string): Promise<MachineModel> {
    const machine = await this.machinesRepo.findOne(id, tenantId);
    if (!machine) {
      throw new NotFoundException('Máquina no encontrada');
    }
    return machine;
  }
}
