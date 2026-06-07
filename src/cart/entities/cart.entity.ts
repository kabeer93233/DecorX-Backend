import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Auth }
from 'src/auth/entities/auth.entity';

import { CartItem }
from './cart-item.entity';

@Entity()

export class Cart {

  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Auth)
  @JoinColumn()
  user!: Auth;

  @OneToMany(
    () => CartItem,
    item => item.cart,
    {
      cascade: true,
    },
  )
  items!: CartItem[];
}