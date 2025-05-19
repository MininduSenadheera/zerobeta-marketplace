import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { OrderStatusTypes, ShippingMethodTypes } from "./order.enums";

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  referenceNo: string;

  @Column({ type: 'enum', enum: ShippingMethodTypes })
  shipping: ShippingMethodTypes;

  @Column('decimal')
  shippingCost: number;

  @Column({ type: 'enum', enum: OrderStatusTypes, default: OrderStatusTypes.Pending })
  status: OrderStatusTypes;

  @Column({ type: 'uuid' })
  buyerId: string;
}