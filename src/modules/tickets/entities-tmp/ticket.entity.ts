// ticket.entity.ts
// Tabla "tickets": ordenes de trabajo o reportes de problemas.
// Cuando un tecnico encuentra algo raro en una visita, crea un ticket.
// El admin puede crear tickets tambien (ej: "revisar camara #3 urgente").

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Machine } from '../../machines/entities/machine.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Empresa a la que pertenece el ticket
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Equipo asociado al problema (opcional, puede ser un ticket general)
  @Column({ name: 'machine_id', type: 'uuid', nullable: true })
  machineId?: string;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine?: Machine;

  // Quien creo el ticket (tecnico o admin)
  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  // Tecnico asignado para resolver (opcional, se asigna despues)
  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  assignedToId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo?: User;

  // Titulo corto del problema
  @Column({ length: 255 })
  title: string;

  // Descripcion detallada
  @Column({ type: 'text', nullable: true })
  description?: string;

  // Prioridad: low, medium, high, urgent
  @Column({ default: 'medium' })
  priority: string;

  // Estado: open, in_progress, resolved, closed
  @Column({ default: 'open' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
