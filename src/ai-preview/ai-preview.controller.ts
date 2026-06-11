import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AiPreviewService } from './ai-preview.service';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { AnalyzeRoomDto } from './dto/analyze-room.dto';
import { SuggestPlacement2dDto } from './dto/suggest-placement-2d.dto';
import { SaveAiDesignDto } from './dto/save-ai-design.dto';

@Controller('ai-preview')
@UseGuards(AuthGuard, EmailVerifiedGuard)
export class AiPreviewController {
  constructor(private readonly service: AiPreviewService) {}

  // ── 2D AI DESIGNER ────────────────────────────────────────────────

  @Post('analyze-room')
  analyzeRoom(@Body() dto: AnalyzeRoomDto) {
    return this.service.analyzeRoom(dto);
  }

  @Post('suggest-placement-2d')
  suggestPlacement2d(@Body() dto: SuggestPlacement2dDto) {
    return this.service.suggestPlacement2d(dto);
  }

  @Post('process-product-image')
  processProductImage(@Body() body: { imageUrl: string }) {
    return this.service.processProductImage(body.imageUrl);
  }

  @Post('save-ai-design')
  saveAiDesign(@Body() dto: SaveAiDesignDto, @Req() req: any) {
    return this.service.saveAiDesign(dto, req.user.id);
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
