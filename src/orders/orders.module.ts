import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { Order } from './entities/order.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Order,
      Auth,
    ])
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [
    OrdersService,
  ],
})
export class OrdersModule {}
