import {

  Injectable,
  NotFoundException,

} from '@nestjs/common';

import { InjectRepository }
from '@nestjs/typeorm';

import { Repository }
from 'typeorm';

import { Auth }
from 'src/auth/entities/auth.entity';

@Injectable()

export class AdminService {

  constructor(

    @InjectRepository(Auth)

    private readonly authRepo:
    Repository<Auth>,
  ) {}

  async getAllUsers() {

    return await this.authRepo.find({

      where: {
        isDeleted: false,
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
    });
  }

  async blockUser(
    id: number,
  ) {

    const user =
    await this.authRepo.findOne({

      where: { id },
    });

    if (!user) {

      throw new NotFoundException(
        'User not found',
      );
    }

    user.isBlocked = true;

    await this.authRepo.save(
      user,
    );

    return {
      message:
      'User blocked successfully',
    };
  }

  async unblockUser(
    id: number,
  ) {

    const user =
    await this.authRepo.findOne({

      where: { id },
    });

    if (!user) {

      throw new NotFoundException(
        'User not found',
      );
    }

    user.isBlocked = false;

    await this.authRepo.save(
      user,
    );

    return {
      message:
      'User unblocked successfully',
    };
  }

  async deleteUser(
    id: number,
  ) {

    const user =
    await this.authRepo.findOne({

      where: { id },
    });

    if (!user) {

      throw new NotFoundException(
        'User not found',
      );
    }

    user.isDeleted = true;

    await this.authRepo.save(
      user,
    );

    return {
      message:
      'User deleted successfully',
    };
  }
}
