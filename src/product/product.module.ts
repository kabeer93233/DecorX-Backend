import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports : [TypeOrmModule.forFeature([Product]), AuthModule],
  providers: [ProductService],
  controllers : [ProductController]
})
export class ProductModule {}
