import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PlacedItemContext {
  @IsNumber() cx: number;
  @IsNumber() cy: number;
  @IsNumber() scale: number;
  @IsString() category: string;
  @IsString() productName: string;
}

export class PlaceItemDto {
  @IsString() roomImageUrl: string;
  @IsString() productName: string;
  @IsString() productCategory: string;
  @IsNumber() @Min(1) productWidthCm: number;
  @IsNumber() @Min(1) productHeightCm: number;
  @IsNumber() @Min(0) @Max(1) floorLineY: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PlacedItemContext)
  existingItems: PlacedItemContext[] = [];
}
