import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class EmailVerifiedGuard
  implements CanActivate {

  canActivate(
    context: ExecutionContext,
  ): boolean {

    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    if (!user.isEmailVerified) {

      throw new ForbiddenException(
        'Please verify your email to access this feature',
      );
    }

    return true;
  }
}