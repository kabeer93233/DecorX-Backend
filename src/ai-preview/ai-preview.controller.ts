import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AiPreviewService } from './ai-preview.service';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { SuggestPlacementDto } from './dto/suggest-placement.dto';
import { RecommendProductsDto } from './dto/recommend-products.dto';
import { SaveDesignDto } from './dto/save-design.dto';

@Controller('ai-preview')
@UseGuards(AuthGuard, EmailVerifiedGuard)
export class AiPreviewController {
  constructor(private readonly service: AiPreviewService) {}

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
}
