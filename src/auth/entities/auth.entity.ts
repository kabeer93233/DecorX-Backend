import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from "typeorm";

import { Wishlist }
from 'src/wishlist/Wishlist Entity/wishlist.entity';
import { Cart } from "src/cart/entities/cart.entity";

@Entity()

export class Auth {

  @PrimaryGeneratedColumn()

  id!: number;

  @Column()

  fullName!: string;

  @Column({
    unique: true,
  })

  email!: string;

  @Column()

  password!: string;

  @Column({
    type: 'text',
    nullable: true,
  })

  emailVerificationToken! : string | null

  @Column({default: false})

  isEmailVerified! : boolean

  @Column({
    default: 'user',
  })

  role!: string;

  @Column({
    default: false,
  })

  isBlocked!: boolean;

  @Column({
    default: false,
  })

  isDeleted!: boolean;

  @CreateDateColumn()

  createdAt!: Date;

  @Column({
    nullable: true,
  })

  phone!: string;

  @Column({
    nullable: true,
  })

  address!: string;

  @Column({
    nullable: true,
  })

  city!: string;

  @Column({
    nullable: true,
  })

  postalCode!: string;

  @OneToMany(
    () => Wishlist,
    (wishlist) => wishlist.user,
  )

  wishlist!: Wishlist[];

  @OneToMany(
    () => Cart,
    cart => cart.user,
  )

  cart!: Cart[];
}
