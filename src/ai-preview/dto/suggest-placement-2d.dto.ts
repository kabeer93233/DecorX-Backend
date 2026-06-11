import { IsString, IsNumber, IsOptional } from 'class-validator';

export class SuggestPlacement2dDto {
  @IsString()
  productCategory!: string;

  @IsNumber()
  canvasWidth!: number;

  @IsNumber()
  canvasHeight!: number;

  @IsOptional()
  @IsString()
  roomImageUrl?: string;

  @IsOptional()
  @IsNumber()
  existingCount?: number;
}
