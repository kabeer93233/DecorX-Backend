import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from 'src/product/products.entity';
import { Auth } from 'src/auth/entities/auth.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Product,
      Auth,
    ])
  ],
  providers: [CartService],
  controllers: [CartController]
})
export class CartModule {}
