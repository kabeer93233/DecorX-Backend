import {

  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,

} from 'typeorm';

import { Auth }
from '../../auth/entities/auth.entity';

import { Product }
from '../../product/products.entity';

@Entity()

export class Wishlist {

  @PrimaryGeneratedColumn()

  id!: number;

  @ManyToOne(
    () => Auth,
    (user) => user.wishlist,
    {
      onDelete: 'CASCADE',
    },
  )

  @JoinColumn({
    name: 'user_id',
  })

  user!: Auth;

  @ManyToOne(
    () => Product,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )

  @JoinColumn({
    name: 'product_id',
  })

  product!: Product;
}