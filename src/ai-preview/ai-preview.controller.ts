import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { AiPreviewService }
from './ai-preview.service';

import { AuthGuard }
from 'src/auth/guards/auth/auth.guard';

import { EmailVerifiedGuard }
from 'src/auth/guards/email-verified.guard';

@Controller('ai-preview')

export class AiPreviewController {

  constructor(

    private readonly aiPreviewService:
    AiPreviewService,

  ) {}

  @Get()

  @UseGuards(
    AuthGuard,
    EmailVerifiedGuard,
  )

  getPreview() {

    return this.aiPreviewService.getPreview();
  }
}