import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ AuthModule],
  controllers: [AdminController],
  providers: [AdminService,AuthGuard]
})
export class AdminModule {}
