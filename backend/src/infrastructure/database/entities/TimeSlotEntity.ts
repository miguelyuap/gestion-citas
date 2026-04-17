
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TimeSlotStatus } from '@domain/enums/TimeSlotStatus';
import { ProviderEntity } from './ProviderEntity';

@Entity('time_slot')
export class TimeSlotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'provider_id' })
  providerId!: string;

  @ManyToOne(() => ProviderEntity, (provider) => provider.timeSlots)
  @JoinColumn({ name: 'provider_id' })
  provider!: ProviderEntity;

  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek!: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ type: 'varchar', length: 50, default: TimeSlotStatus.AVAILABLE })
  status!: TimeSlotStatus;

  @Column({ name: 'max_appointments', type: 'int', default: 1 })
  maxAppointments!: number;

  @Column({ name: 'appointments_booked', type: 'int', default: 0 })
  appointmentsBooked!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'is_recurring', type: 'boolean', default: true })
  isRecurring!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
