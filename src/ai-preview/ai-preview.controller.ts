import { Controller, Get, Delete, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AiPreviewService } from './ai-preview.service';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { AnalyzeRoomDto } from './dto/analyze-room.dto';

@Controller('ai-preview')
@UseGuards(AuthGuard, EmailVerifiedGuard)
export class AiPreviewController {
  constructor(private readonly service: AiPreviewService) {}

  @Post('analyze-room')
  analyzeRoom(@Body() dto: AnalyzeRoomDto) {
    return this.service.analyzeRoom(dto);
  }

  @Get('my-ai-designs')
  getMyAiDesigns(@Req() req: any) {
    return this.service.getMyAiDesigns(req.user.id);
  }

  @Delete('ai-designs/:id')
  deleteAiDesign(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteAiDesign(id, req.user.id);
  }
}
