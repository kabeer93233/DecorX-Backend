import {

  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  ParseIntPipe,

} from '@nestjs/common';

import { AdminService }
from './admin.service';

import { AuthGuard }
from '../auth/guards/auth/auth.guard';

import { AdminGuard }
from './guards/admin/admin.guard';

@Controller('admin')

@UseGuards(
  AuthGuard,
  AdminGuard,
)

export class AdminController {

  constructor(

    private readonly adminService:
    AdminService,
  ) {}

  @Get('users')

  getAllUsers() {

    return this.adminService
    .getAllUsers();
  }

  @Patch(
    'users/:id/block',
  )

  blockUser(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.adminService
    .blockUser(id);
  }

  @Patch(
    'users/:id/unblock',
  )

  unblockUser(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.adminService
    .unblockUser(id);
  }

  @Delete(
    'users/:id',
  )

  deleteUser(

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.adminService
    .deleteUser(id);
  }
}