
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  TableInheritance,
} from 'typeorm';
import { UserRole } from '@domain/enums/UserRole';
import { AppointmentEntity } from './AppointmentEntity';

@Entity('user')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone!: string;

  @Column({ type: 'varchar', length: 50, default: UserRole.CLIENT })
  role!: UserRole;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string;

  @Column({ name: 'refresh_token_expiry', type: 'datetime', nullable: true })
  refreshTokenExpiry?: Date;

  @Column({ name: 'email_verified_at', type: 'datetime', nullable: true })
  emailVerifiedAt?: Date;

  @OneToMany(() => AppointmentEntity, (appointment) => appointment.client)
  appointmentsAsClient!: AppointmentEntity[];

  @Column({ name: 'triage_enabled', type: 'boolean', default: true })
  triageEnabled!: boolean;

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  specialInstructions?: string;
}
