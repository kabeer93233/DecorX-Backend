import { IsString, IsArray, IsOptional } from 'class-validator';

export class RecommendProductsDto {
  @IsString()
  roomType!: string;

  @IsArray()
  @IsOptional()
  alreadyPlacedCategories?: string[];
}
