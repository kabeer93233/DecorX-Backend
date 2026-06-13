import { Controller, Get, Post, Body, Patch, UseGuards, Req, Res, Query } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/SignUp.dto';
import { LoginDTO } from './dto/Login.dto';
import { AuthGuard } from './guards/auth/auth.guard';

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 15 * 60 * 1000, // 15 min
};

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/auth',
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async create(@Body() signupDto: SignupDTO) {
    return this.authService.signUp(signupDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() req) {
    return req.user;
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  async Login(
    @Body() loginDto: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } = await this.authService.login(loginDto);

    res.cookie('access_token', access_token, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refresh_token', refresh_token, REFRESH_TOKEN_COOKIE_OPTIONS);

    return { user };
  }

  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];

    const { access_token, refresh_token, user } = await this.authService.refreshToken(refreshToken);

    res.cookie('access_token', access_token, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refresh_token', refresh_token, REFRESH_TOKEN_COOKIE_OPTIONS);

    return { user };
  }

  @UseGuards(AuthGuard)
  @Post('/logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];

    res.clearCookie('access_token', ACCESS_TOKEN_COOKIE_OPTIONS);
    res.clearCookie('refresh_token', REFRESH_TOKEN_COOKIE_OPTIONS);

    return this.authService.logout(refreshToken);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.authService.getProfile(req['userId']);
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  updateProfile(@Req() req, @Body() body) {
    return this.authService.updateProfile(req['userId'], body);
  }

  @UseGuards(AuthGuard)
  @Get('wishlist')
  getWishlist(@Req() req) {
    return {
      message: 'Wishlist',
      userId: req['userId'],
    };
  }

  @UseGuards(AuthGuard)
  @Get('cart')
  getCart(@Req() req) {
    return {
      message: 'User Cart',
      userId: req['userId'],
    };
  }
}