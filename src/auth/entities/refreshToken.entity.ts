import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { Auth } from './auth.entity';

@Entity('refresh_tokens')
export class RefreshToken {

  @PrimaryGeneratedColumn()
  id!: string;

  @Column({
    type: 'text',
  })
  token!: string;

  @Column({
    type: 'timestamp',
  })
  expiryDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(
    () => Auth,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'user_id',
  })
  user!: Auth;
}