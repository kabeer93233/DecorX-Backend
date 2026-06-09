import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';

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
