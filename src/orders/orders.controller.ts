import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { EmailVerifiedGuard } from 'src/auth/guards/email-verified.guard';

@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
    @UseGuards(
    AuthGuard,
    EmailVerifiedGuard,
    )
    @Post('checkout')
    checkout() {

    }
}
