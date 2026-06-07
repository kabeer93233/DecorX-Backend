import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/SignUp.dto';
import { LoginDTO } from './dto/Login.dto'
import { RefreshTokenDTO } from './dto/refreshToken.dto';
import { AuthGuard } from './guards/auth/auth.guard';
// import { UpdateAuthDto } from './dto/update-auth.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async create(@Body() signupDto: SignupDTO) {
    return this.authService.signUp(signupDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(
    @Req() req,
  ) {

    return req.user;
  }

  @Get('verify-email')
    async verifyEmail(@Query('token') token: string,) {
      return this.authService.verifyEmail(token);
    }

  @Post('login')
  async Login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDTO : RefreshTokenDTO) {
    return this.authService.refreshToken(refreshTokenDTO.refreshToken);
  }

  @UseGuards(AuthGuard)
  @Post('/logout')
  logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req) {

    return this.authService.getProfile(
      req['userId'],
    );
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  updateProfile(
    @Req() req,
    @Body() body,
  ) {

    return this.authService.updateProfile(
      req['userId'],
      body,
    );
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
