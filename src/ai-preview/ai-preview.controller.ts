import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AiPreviewService } from './ai-preview.service';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { SuggestPlacementDto } from './dto/suggest-placement.dto';
import { RecommendProductsDto } from './dto/recommend-products.dto';
import { SaveDesignDto } from './dto/save-design.dto';
import { AnalyzeRoomDto } from './dto/analyze-room.dto';
import { SuggestPlacement2dDto } from './dto/suggest-placement-2d.dto';
import { SaveAiDesignDto } from './dto/save-ai-design.dto';
import { PlaceItemDto } from './dto/place-item.dto';
import { RedesignRoomDto } from './dto/redesign-room.dto';

@Controller('ai-preview')
@UseGuards(AuthGuard, EmailVerifiedGuard)
export class AiPreviewController {
  constructor(private readonly service: AiPreviewService) {}

  // ── 3D EDITOR ─────────────────────────────────────────────────────

  @Post('recommend-products')
  recommendProducts(@Body() dto: RecommendProductsDto) {
    return this.service.recommendProducts(dto);
  }

  @Post('suggest-placement')
  suggestPlacement(@Body() dto: SuggestPlacementDto) {
    return this.service.suggestPlacement(dto);
  }

  @Post('save-design')
  saveDesign(@Body() dto: SaveDesignDto, @Req() req: any) {
    return this.service.saveDesign(dto, req.user.id);
  }

  @Get('my-designs')
  getMyDesigns(@Req() req: any) {
    return this.service.getMyDesigns(req.user.id);
  }

  @Get('designs/:id')
  getDesign(@Param('id') id: string, @Req() req: any) {
    return this.service.getDesign(id, req.user.id);
  }

  @Delete('designs/:id')
  deleteDesign(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteDesign(id, req.user.id);
  }

  // ── 2D AI DESIGNER ────────────────────────────────────────────────

  @Post('analyze-room')
  analyzeRoom(@Body() dto: AnalyzeRoomDto) {
    return this.service.analyzeRoom(dto);
  }

  @Post('place-item')
  placeItem(@Body() dto: PlaceItemDto) {
    return this.service.placeItem(dto);
  }

  @Post('redesign-room')
  redesignRoom(@Body() dto: RedesignRoomDto) {
    return this.service.redesignRoom(dto);
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
