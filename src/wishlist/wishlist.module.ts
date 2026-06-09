import { Module }
from '@nestjs/common';

import { WishlistService }
from './wishlist.service';

import { WishlistController }
from './wishlist.controller';

import { TypeOrmModule }
from '@nestjs/typeorm';

import { Wishlist }
from './Wishlist Entity/wishlist.entity';

import { Product }
from '../product/products.entity';
import { AuthModule } from '../auth/auth.module';

@Module({

  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Wishlist,
      Product,
    ]),
  ],

  controllers: [
    WishlistController,
  ],

  providers: [
    WishlistService,
  ],
})

export class WishlistModule {}