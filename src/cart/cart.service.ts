import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';

import { Product } from 'src/product/products.entity';

import { Auth } from 'src/auth/entities/auth.entity';

import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()

export class CartService {

  constructor(

    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(Auth)
    private authRepo: Repository<Auth>,
  ) {}

  async addToCart(
    userId: number,
    dto: AddToCartDto,
  ) {

    const {
      productId,
      quantity,
    } = dto;

    const product =
      await this.productRepo.findOne({

        where: {
          id: productId,
        },
      });

    if (!product) {

      throw new NotFoundException(
        'Product not found',
      );
    }

    const user =
      await this.authRepo.findOne({

        where: {
          id: userId,
        },
      });

    if (!user) {

      throw new NotFoundException(
        'User not found',
      );
    }

    let cart =
      await this.cartRepo.findOne({

        where: {

          user: {
            id: userId,
          },
        },

        relations: ['items'],
      });

    if (!cart) {

      cart = this.cartRepo.create({

        user,
        items: [],
      });

      await this.cartRepo.save(cart);
    }

    let existingItem =
      await this.cartItemRepo.findOne({

        where: {

          cart: {
            id: cart.id,
          },

          product: {
            id: productId,
          },
        },

        relations: ['product'],
      });

    if (existingItem) {

      existingItem.quantity += quantity;

      return await this.cartItemRepo.save(
        existingItem,
      );
    }

    const cartItem =
      this.cartItemRepo.create({

        quantity,
        cart,
        product,
      });

    return await this.cartItemRepo.save(
      cartItem,
    );
  }

  async getCart(userId: number) {

    const cart =
      await this.cartRepo.findOne({

        where: {

          user: {
            id: userId,
          },
        },

        relations: [
          'items',
          'items.product',
        ],
      });

    if (!cart) {

      return {
        items: [],
      };
    }

    return cart;
  }

  async removeCartItem(
    itemId: number,
    userId: number,
  ) {

    const cartItem =
      await this.cartItemRepo.findOne({

        where: {

          id: itemId,

          cart: {

            user: {
              id: userId,
            },
          },
        },

        relations: [
          'cart',
          'cart.user',
        ],
      });

    if (!cartItem) {

      throw new NotFoundException(
        'Cart item not found',
      );
    }

    await this.cartItemRepo.remove(
      cartItem,
    );

    return {
      message:
        'Item removed from cart',
    };
  }

  async updateQuantity(
    itemId: number,
    quantity: number,
    userId: number,
  ) {

    const cartItem =
      await this.cartItemRepo.findOne({

        where: {

          id: itemId,

          cart: {

            user: {
              id: userId,
            },
          },
        },

        relations: [
          'cart',
          'cart.user',
        ],
      });

    if (!cartItem) {

      throw new NotFoundException(
        'Cart item not found',
      );
    }

    cartItem.quantity = quantity;

    return await this.cartItemRepo.save(
      cartItem,
    );
  }

  async clearCart(userId: number) {

    const cart =
      await this.cartRepo.findOne({

        where: {

          user: {
            id: userId,
          },
        },

        relations: ['items'],
      });

    if (!cart) {

      return {
        message: 'Cart already empty',
      };
    }

    await this.cartItemRepo.remove(
      cart.items,
    );

    return {
      message: 'Cart cleared',
    };
  }
}