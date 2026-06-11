import {

  Injectable,
  NotFoundException,

} from '@nestjs/common';

import { InjectRepository }
from '@nestjs/typeorm';

import { Repository }
from 'typeorm';

import { Order }
from './entities/order.entity';

import { CreateOrderDto }
from './dto/create-order.dto';

import { Auth }
from '../auth/entities/auth.entity';

import { OrderStatus }
from './enums/order-status.enum';

import { PaymentStatus }
from './enums/payment-status.enum';

@Injectable()
export class OrdersService {

  constructor(

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(Auth)
    private userRepo: Repository<Auth>,
  ) {}

  // CREATE ORDER

  async createOrder(

    dto: CreateOrderDto,

    userId: number,
  ) {

    const user =
    await this.userRepo.findOne({

      where: {
        id: userId,
      },
    });

    if (!user) {

      throw new NotFoundException(
        'User not found',
      );
    }

    const order =
    this.orderRepo.create({

      ...dto,

      paymentStatus:
      PaymentStatus.PENDING,

      orderStatus:
      OrderStatus.PENDING,

      user,
    });

    await this.orderRepo.save(
      order,
    );

    return {

      message:
      'Order placed successfully',

      order,
    };
  }

  // USER ORDERS

  async getUserOrders(
    userId: number,
  ) {

    return await this.orderRepo.find({

      where: {

        user: {
          id: userId,
        },
      },

      order: {
        createdAt: 'DESC',
      },
    });
  }

  // ADMIN ORDERS

  async getAllOrders() {

    return await this.orderRepo.find({

      relations: ['user'],

      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {

    return await this.orderRepo.findOne({

        where: { id },

        relations: ['user'],
    });
    }

  // UPDATE ORDER STATUS

  async updateOrderStatus(

    id: number,

    orderStatus: OrderStatus,
  ) {

    const order =
    await this.orderRepo.findOne({

      where: { id },
    });

    if (!order) {

      throw new NotFoundException(
        'Order not found',
      );
    }

    order.orderStatus =
    orderStatus;

    // If delivered => payment paid

    if (
      orderStatus ===
      OrderStatus.DELIVERED
    ) {

      order.paymentStatus =
      PaymentStatus.PAID;
    }

    await this.orderRepo.save(
      order,
    );

    return {

      message:
      'Order status updated',

      order,
    };
  }
}