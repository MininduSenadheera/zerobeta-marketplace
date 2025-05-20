import { IsOptional } from 'class-validator';
import { UserRoleTypes } from 'src/enums/user.enums';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  firstname: string;

  @Column({ length: 64 })
  lastname: string;

  @Column({ unique: true })
  @Column({ length: 128 })
  email: string;

  @Column({ length: 64, nullable: true })
  country?: string;

  @Column({nullable: true})
  password: string;

  @Column({ type: 'enum', enum: UserRoleTypes })
  userRole: UserRoleTypes;

  @Column({ default: false })
  isTemp: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}