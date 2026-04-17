import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AppointmentStatus } from '@domain/enums/AppointmentStatus';
import { UserEntity } from './UserEntity';
import { ProviderEntity } from './ProviderEntity';

@Entity('appointment')
export class AppointmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'client_id' })
  clientId!: string;

  @Column({ name: 'provider_id' })
  providerId!: string;

  @ManyToOne(() => UserEntity, (user) => user.appointmentsAsClient)
  @JoinColumn({ name: 'client_id' })
  client!: UserEntity;

  @ManyToOne(() => ProviderEntity, (provider) => provider.appointmentsAsProvider)
  @JoinColumn({ name: 'provider_id' })
  provider!: ProviderEntity;

  @Column({ name: 'service_type', type: 'varchar', length: 100 })
  serviceType!: string;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime!: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime!: Date;

  @Column({ type: 'varchar', length: 50, default: AppointmentStatus.PENDING })
  status!: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'cancellation_reason', type: 'varchar', length: 255, nullable: true })
  cancellationReason!: string | null;

  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy!: string | null;

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
