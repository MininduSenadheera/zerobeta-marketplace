import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderStatusTypes, ShippingMethodTypes } from "../enums/order.enums";
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

  @Column({ type: 'enum', enum: ShippingMethodTypes })
  shipping: ShippingMethodTypes;

  @Column('decimal')
  shippingCost: number;

  @Column({ type: 'enum', enum: OrderStatusTypes, default: OrderStatusTypes.Pending })
  status: OrderStatusTypes;

  @Column({ type: 'uuid' })
  buyerId: string;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}