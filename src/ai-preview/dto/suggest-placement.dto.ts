import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class SuggestPlacementDto {
  @IsString()
  roomId!: string;

  @IsString()
  productCategory!: string;

  @IsNumber()
  productWidth!: number;

  @IsNumber()
  productDepth!: number;

  @IsArray()
  @IsOptional()
  existingItems?: Array<{
    category: string;
    position: [number, number, number];
    width?: number;
    depth?: number;
  }>;
}
