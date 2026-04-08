import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from '../../user/entity/user.entity';

@Entity('product_analyses')
export class ProductAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null = null;

  @Column({ type: 'integer' })
  compatibilityScore!: number; // 0-100

  @Column({ type: 'simple-json', default: '[]' })
  compatibilityAlerts!: Array<{
    severity: string;
    message: string;
    ingredient: string;
  }>;

  @Column({ type: 'simple-json', default: '[]' })
  ingredientAnalysis!: Array<{
    name: string;
    safetyLevel: string;
    benefits: string[];
    concerns: string[];
    avoidWith?: string[];
  }>;

  @Column({ type: 'simple-json', default: '[]' })
  labels!: string[]; // e.g., ['clean-beauty', 'natural', 'cruelty-free']

  @Column({ type: 'simple-json', nullable: true })
  aiInsights?: {
    summary?: string;
    recommendations?: string[];
    ritualCompatibility?: string;
  };

  @Column({ type: 'text', nullable: true })
  rawAiResponse?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Product, (product) => product.analyses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
