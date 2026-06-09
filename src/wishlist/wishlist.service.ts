import {

  Injectable,
  NotFoundException,

} from '@nestjs/common';

import { InjectRepository }
from '@nestjs/typeorm';

import { Repository }
from 'typeorm';

import { Wishlist }
from './Wishlist Entity/wishlist.entity';

import { CreateWishlistDTO }
from './Wishlist Dto/wishlist.dto';

import { Product }
from '../product/products.entity';

@Injectable()

export class WishlistService {

  constructor(

    @InjectRepository(Wishlist)

    private wishlistRepo:
    Repository<Wishlist>,

    @InjectRepository(Product)

    private productRepo:
    Repository<Product>,
  ) {}

  // ADD TO WISHLIST

  async addToWishlist(

    userId: number,

    dto: CreateWishlistDTO,
  ) {

    const product =
      await this.productRepo.findOne({

        where: {
          id: dto.productId,
        },
      });

    if (!product) {

      throw new NotFoundException(
        'Product not found',
      );
    }

    const existing =
      await this.wishlistRepo.findOne({

        where: {

          user: {
            id: userId,
          },

          product: {
            id: dto.productId,
          },
        },  
      });

    if (existing) {

      return {
        message:
        'Already in wishlist',
      };
    }

    const wishlist =
      this.wishlistRepo.create({

        user: {
          id: userId,
        },

        product: {
          id: dto.productId,
        },
      });

    await this.wishlistRepo.save(
      wishlist,
    );

    return {
      message:
      'Added to wishlist',
    };
  }

  // GET USER WISHLIST

  async getWishlist(userId: number) {

  return await this.wishlistRepo.find({

    where: {
      user: {
        id: userId,
      },
    },

    relations: [
      'product',
    ],
  });
}

  // REMOVE WISHLIST ITEM

  async removeWishlist(
    productId: number,
    userId: number,
    ) {

    const wishlist =
        await this.wishlistRepo.findOne({

        where: {

            product: {
            id: productId,
            },

            user: {
            id: userId,
            },
        },
        });

    if (!wishlist) {

        throw new NotFoundException(
        'Wishlist item not found',
        );
    }

    await this.wishlistRepo.remove(
        wishlist,
    );

    return {
        message:
        'Removed from wishlist',
    };
    }
}