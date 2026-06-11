import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { AiPreviewService }
from './ai-preview.service';

import { AuthGuard }
from '../auth/guards/auth/auth.guard';

import { EmailVerifiedGuard }
from '../auth/guards/email-verified.guard';

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