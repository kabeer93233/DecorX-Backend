import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Auth }
from '../../auth/entities/auth.entity';

import { OrderStatus }
from '../enums/order-status.enum';

import { PaymentStatus }
from '../enums/payment-status.enum';

@Entity('orders')

export class Order {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fullName!: string;

 @Column()
    email!: string;

    @Column()
    address!: string;

  @Column()
  phone!: string;

  @Column()
  city!: string;

  @Column()
  postalCode!: string;

  @Column('float')
  total!: number;

  @Column()
  paymentMethod!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus!: PaymentStatus;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus!: OrderStatus;

  @Column({
    type: 'json',
  })
  items!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(
    () => Auth,
    (user) => user.orders,
    {
      onDelete: 'CASCADE',
    },
  )
  user!: Auth;
}