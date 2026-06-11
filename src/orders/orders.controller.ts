import {

  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,

} from '@nestjs/common';

import { OrdersService }
from './orders.service';

import { AuthGuard }
from '../auth/guards/auth/auth.guard';

import { EmailVerifiedGuard }
from '../auth/guards/email-verified.guard';

import { CreateOrderDto }
from './dto/create-order.dto';

import { OrderStatus }
from './enums/order-status.enum';

@UseGuards(
  AuthGuard,
)
@Controller('orders')
export class OrdersController {

  constructor(

    private readonly ordersService:
    OrdersService,
  ) {}

  // CHECKOUT / PLACE ORDER

  @UseGuards(
    EmailVerifiedGuard,
  )
  @Post('checkout')
  checkout(

    @Body()
    dto: CreateOrderDto,

    @Req()
    req,
  ) {

    return this.ordersService.createOrder(

      dto,

      req.user.id,
    );
  }

  // USER ORDERS

  @Get('my-orders')
  getMyOrders(
    @Req() req,
  ) {

    return this.ordersService.getUserOrders(
      req.user.id,
    );
  }

  // ADMIN ALL ORDERS

  @Get()
  getAllOrders() {

    return this.ordersService.getAllOrders();
  }

  // GET SINGLE ORDER

    @Get(':id')
    getSingleOrder(

    @Param('id')
    id: string,
    ) {

    return this.ordersService.findOne(
        Number(id),
    );
    }

  // UPDATE STATUS

  @Patch(':id/status')
  updateStatus(

    @Param('id')
    id: number,

    @Body('status')
    status: OrderStatus,
  ) {

    return this.ordersService.updateOrderStatus(

      Number(id),

      status,
    );
  }
}