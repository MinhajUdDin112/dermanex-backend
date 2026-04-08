import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { ProductAnalysis } from './product-analysis.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  barcode!: string;

  @Column({ type: 'varchar' })
  productName!: string;

  @Column({ type: 'varchar', nullable: true })
  brand?: string;

  @Column({ type: 'varchar', nullable: true })
  productCategory?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({ type: 'json', nullable: true })
  rawData?: any; // Store raw data from Open Beauty Facts

  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToMany(() => Ingredient, (ingredient) => ingredient.products, {
    eager: false,
    cascade: ['insert', 'update'],
  })
  @JoinTable({
    name: 'product_ingredients',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'ingredientId', referencedColumnName: 'id' },
  })
  ingredients!: Ingredient[];

  @OneToMany(() => ProductAnalysis, (analysis) => analysis.product, {
    eager: false,
    cascade: ['insert', 'update'],
  })
  analyses!: ProductAnalysis[];
}
