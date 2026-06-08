import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './product/product.controller';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product/product.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CartModule } from './cart/cart.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { AiPreviewModule } from './ai-preview/ai-preview.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [ProductModule,
    ConfigModule.forRoot({
      isGlobal : true,
    }),
    TypeOrmModule.forRoot({
      type : 'postgres',
      url : process.env.DATABASE_URL,
      autoLoadEntities : true,
      ssl: {
        rejectUnauthorized: false,
      },
      synchronize : false
    }),
    OrdersModule,
    AuthModule,
    WishlistModule,
    CartModule,
    AdminModule,
    MailModule,
    AiPreviewModule,
    ContactModule
  ],
  controllers: [AppController, OrdersController],
  providers: [AppService],
})
export class AppModule {}
