import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { RefreshToken } from './entities/refreshToken.entity';
import { AuthGuard } from './guards/auth/auth.guard';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports : [TypeOrmModule.forFeature([Auth, RefreshToken]), MailModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports:[
    AuthGuard,
    TypeOrmModule
  ],
})
export class AuthModule {}
