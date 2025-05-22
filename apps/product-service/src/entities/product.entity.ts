import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ unique: true })
  name: string;

  @Column({ length: 100 })
  description: string;

  @Column({type: 'decimal', precision: 10, scale: 2})
  price: number;

  @Column({type: 'int'})
  stock: number;

  @Column({ type: 'int', default: 0 })
  orderCount: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'uuid' })
  sellerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
