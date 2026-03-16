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
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  hashed_password: string | null;

  @Column({ type: 'varchar', nullable: true })
  full_name: string | null;

  @Column({ type: 'varchar', nullable: true })
  reset_password_otp_hash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_password_otp_expires_at: Date | null;

  @Column({ type: 'varchar', nullable: true })
  bio: string | null;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  isOnboarded: boolean;

  @Column('text', {
    array: true,
    default: () => 'ARRAY[]::text[]',
  })
  skinGoals: string[];

  @Column({ type: 'varchar', nullable: true, default: null })
  profilePicture: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
