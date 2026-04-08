import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  inci?: string; // International Nomenclature of Cosmetic Ingredients

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', default: 'UNKNOWN' })
  safetyLevel: 'SAFE' | 'CAUTION' | 'UNSAFE' | 'UNKNOWN' = 'UNKNOWN';

  @Column({ type: 'text', nullable: true })
  benefits?: string;

  @Column({ type: 'text', nullable: true })
  concerns?: string;

  @Column({ type: 'simple-json', nullable: true })
  compatibilityInfo?: {
    avoidWith?: string[];
    benefitsFrom?: string[];
    pH?: string;
  };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @ManyToMany(() => Product, (product) => product.ingredients)
  products!: Product[];
}
