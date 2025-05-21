import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  country?: string;

  @Column({nullable: true})
  password: string;

  @Column({ type: 'text' })
  userRole: string;

  @Column({ default: false })
  isTemp: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}