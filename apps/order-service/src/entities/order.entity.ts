import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  referenceNo: string;

  @Column('text')
  address: string;

  @Column('text')
  city: string;

  @Column('text')
  country: string;

  @Column({ type: 'text' })
  shipping: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shippingCost: number;

  @Column({ type: 'text', default: 'Pending' })
  status: string;

  @Column({ type: 'uuid' })
  buyerId: string;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}