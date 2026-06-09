import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import {Request} from 'express';
import { InjectRepository }
from '@nestjs/typeorm';

import { Repository }
from 'typeorm';

import { Auth }
from '../../entities/auth.entity';

import {
  ForbiddenException,
} from '@nestjs/common';


@Injectable()
export class AuthGuard implements CanActivate {
constructor(

  private configService:
  ConfigService,

  @InjectRepository(Auth)

  private readonly authRepo:
  Repository<Auth>,

){}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.ExtractTokenFromHeader(request);
    if(!token){
      throw new UnauthorizedException("Invalid Token");
    }
    const jwtsecret = this.configService.get<string>('JWT_TOKEN');
    if(!jwtsecret){
      throw new UnauthorizedException('JWT Secret not Found');
    }
    try {
      const payload: any =
        jwt.verify(
          token,
          jwtsecret,
        );
        
      const user =
      await this.authRepo.findOne({

        where: {
          id: payload.id,
        },
      });

      if (!user) {

        throw new UnauthorizedException(
          'User not found',
        );
      }

      if (user.isBlocked) {

        throw new ForbiddenException(
          'Your account is blocked',
        );
      }

      if (user.isDeleted) {

        throw new ForbiddenException(
          'Account deleted',
        );
      }

      request['role'] =
      user.role;

      request['userId'] =
      user.id;

      request['user'] = user;

    } catch (e) {

      Logger.error(e);

      throw new UnauthorizedException(
        'Invalid Token',
      );
    }

    return true;
  }
  private ExtractTokenFromHeader(request : Request) : string | undefined {
    return request.headers['authorization']?.split(' ')[1];    
  }
}
