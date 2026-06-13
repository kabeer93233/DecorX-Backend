import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDTO } from './dto/SignUp.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/Login.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refreshToken.entity';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
  @InjectRepository(RefreshToken)
  private refeshTokenRepo : Repository<RefreshToken>,
  private mailService : MailService,
  @InjectRepository(Auth)
  private authRepository : Repository<Auth>,
  private configService : ConfigService){}

  // sign up service
  async signUp(signupDTO: SignupDTO) : Promise<{message : string}> {
    const {fullName, email, password} = signupDTO;
    const emailFind = await this.authRepository.findOneBy({
      email,
    })
    if(emailFind){
      throw new BadRequestException("Email already in use");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    await this.mailService.sentOtp(verificationToken, email);
    const signedUp = await this.authRepository.create({
      fullName,
      email,
      password : hashedPassword,
      emailVerificationToken: verificationToken,
    });
    await this.authRepository.save(signedUp);
    return {message: "Verification Link is sent to your Email"};
  }

  async verifyEmail(
    token: string,
  ) {

    const user =
    await this.authRepository.findOne({
      where: {
        emailVerificationToken:
        token,
      },
    });

    if (!user) {

      throw new BadRequestException(
        'Invalid verification link',
      );
    }

    user.isEmailVerified = true;

    user.emailVerificationToken = null;

    await this.authRepository.save(
      user,
    );

    return {
      message:
      'Email verified successfully',
    };
  }

  async login(loginDto: LoginDTO) {
    const { email, password } = loginDto;

    const user = await this.authRepository.findOneBy({ email });

    if (!user) {
      throw new ForbiddenException('User does not exist with this Email!');
    }

    const pass = await bcrypt.compare(password, user.password);

    if (!pass) {
      throw new UnauthorizedException('Wrong Credentials');
    }
    return this.generateToken(user);
  }

  async generateToken(user : any){

    await this.refeshTokenRepo.delete({
      user:{
        id:user.id,
      },
    });

    const accessToken = jwt.sign(
      {
        id : user.id,
        role:user.role,
        type: 'access'
      },
      this.configService.get<string>('JWT_TOKEN')!,
      { expiresIn: '15m' },
    );

    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, user.id);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified:
        user.isEmailVerified,
      },
    };
  }

  async storeRefreshToken(token: string, user_id){
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.refeshTokenRepo.save({
      token,
      expiryDate,
      user : {
        id : user_id
      }
    });
  }

  async refreshToken(refreshToken: string) {

    const token = await this.refeshTokenRepo.findOne({
      where: {
        token: refreshToken,
        expiryDate: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!token) {
      throw new UnauthorizedException("Refresh Token is Invalid");
    }
    await this.refeshTokenRepo.delete({
      token : refreshToken,
    })
    return this.generateToken(token.user);
  }

  async logout(
  refreshToken: string,
  ) {

    await this.refeshTokenRepo.delete({
      token: refreshToken,
    });

    return {
      message: "Logged Out",
    };
  }

  async getProfile(
  userId: number,
  ) {

    const user =
      await this.authRepository.findOne({

        where: {
          id: userId,
        },
      });

    if (!user) {

      throw new UnauthorizedException(
        'User not found',
      );
    }

    return user;
  }

  async updateProfile(
  userId: number,
  body: any,
  ) {

    const user =
      await this.authRepository.findOne({
        where: {
          id: userId,
        },
      });

    if (!user) {

      throw new UnauthorizedException(
        'User not found',
      );
    }

    user.phone =
      body.phone;

    user.address =
      body.address;

    user.city =
      body.city;

    user.postalCode =
      body.postalCode;

    await this.authRepository.save(
      user,
    );

    return user;
  }
}