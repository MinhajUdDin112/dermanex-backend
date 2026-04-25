import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  hashed_password: string | null = null;

  @Column({ type: 'varchar', nullable: true })
  full_name: string | null = null;

  @Column({ type: 'varchar', nullable: true })
  reset_password_otp_hash: string | null = null;

  @Column({ type: 'timestamp', nullable: true })
  reset_password_otp_expires_at: Date | null = null;

  @Column({ default: false })
  is_email_verified: boolean = false;

  @Column({ type: 'varchar', nullable: true })
  email_verification_otp_hash: string | null = null;

  @Column({ type: 'timestamp', nullable: true })
  email_verification_otp_expires_at: Date | null = null;

  @Column({ type: 'varchar', nullable: true })
  bio: string | null = null;

  @Column({ default: true })
  is_active: boolean = true;

  @Column({ default: false })
  isOnboarded: boolean = false;

  @Column('text', {
    array: true,
    default: () => 'ARRAY[]::text[]',
  })
  skinGoals: string[] = [];

  @Column({ type: 'varchar', nullable: true, default: null })
  profilePicture: string | null = null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
