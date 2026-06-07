import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { EmailVerifiedGuard } from 'src/auth/guards/email-verified.guard';

  // @UseGuards(
  //   AuthGuard,
  //   EmailVerifiedGuard,
  // )
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  @Post('add')
  @UseGuards(AuthGuard)
  addToCart(
    @Req() req,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addToCart(
      req.userId,
      dto,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  getCart(@Req() req) {
    return this.cartService.getCart(
      req.userId,
    );
  }

  @Delete('item/:id')
  @UseGuards(AuthGuard)
  removeCartItem(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.cartService.removeCartItem(
      Number(id),
      req.userId,
    );
  }

  @Patch('item/:id')
  @UseGuards(AuthGuard)
  updateQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Req() req,
  ) {
    return this.cartService.updateQuantity(
      Number(id),
      quantity,
      req.userId,
    );
  }

  @Delete('clear')
  @UseGuards(AuthGuard)
  clearCart(@Req() req) {
    return this.cartService.clearCart(
      req.userId,
    );
  }
}