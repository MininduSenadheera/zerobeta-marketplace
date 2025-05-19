import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column()
  quantity: number;

  @Column('decimal')
  unitPrice: number;
}