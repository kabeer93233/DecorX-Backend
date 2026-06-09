import {

  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,

} from '@nestjs/common';

import { WishlistService }
from './wishlist.service';

import { CreateWishlistDTO }
from './Wishlist Dto/wishlist.dto';

import { AuthGuard }
from '../auth/guards/auth/auth.guard';

@UseGuards(AuthGuard)

@Controller('wishlist')

export class WishlistController {

  constructor(

    private readonly wishlistService:
    WishlistService,
  ) {}

  // ADD

  @Post('add')

  addWishlist(

    @Req() req,

    @Body()
    dto: CreateWishlistDTO,
  ) {

    return this.wishlistService
    .addToWishlist(
      req['userId'],
      dto,
    );
  }

  // GET

    @Get()
    async getWishlist(
    @Req() req,
    ) {

    return this.wishlistService.getWishlist(
        req['userId'],
    );
    }

  // REMOVE

  @Delete(':productId')

    removeWishlist(

    @Param('productId')
    productId: number,

    @Req() req,
    ) {

    return this.wishlistService
    .removeWishlist(

        Number(productId),

        req['userId'],
    );
    }
}