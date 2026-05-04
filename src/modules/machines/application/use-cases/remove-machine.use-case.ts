import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { MachineRepositoryPort } from '../../domain/repositories/machine.repository.port';

@Injectable()
export class RemoveMachineUseCase {
  constructor(
    @Inject('MACHINE_REPOSITORY')
    private readonly machinesRepo: MachineRepositoryPort,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const machine = await this.machinesRepo.findOne(id, tenantId);
    if (!machine) {
      throw new NotFoundException('Máquina no encontrada');
    }
    await this.machinesRepo.softRemove(machine);
  }
}
