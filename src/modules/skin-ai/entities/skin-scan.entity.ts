import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';

@Entity()
export class SkinScan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar' })
  image_url: string;

  @Column({ type: 'varchar', nullable: true })
  model: string | null;

  @Column({ type: 'varchar', nullable: true })
  top_label: string | null;

  @Column({ type: 'float', nullable: true })
  confidence: number | null;

  @Column({ type: 'varchar', nullable: true })
  inflammation: string | null;

  @Column({ type: 'jsonb', nullable: true })
  predictions: Array<{ label: string; percentage: number }> | null;

  @CreateDateColumn({ name: 'scanned_at' })
  scannedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'enum', enum: ['morning', 'evening'], nullable: true })
  timeOfDay: 'morning' | 'evening';

  // ✅ BEAUTY DATA
  @Column({ type: 'int', nullable: true })
  skin_score: number;

  @Column({ type: 'jsonb', nullable: true })
  metrics: any;

  @Column({ type: 'jsonb', nullable: true })
  insights: string[];

  @Column({ type: 'jsonb', nullable: true })
  ritual: any[];

  @Column({ type: 'int', nullable: true })
  progress: number;
}
