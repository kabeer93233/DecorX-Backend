import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RoomItemForDesign {
  @IsString() id: string;
  @IsString() productName: string;
  @IsString() category: string;
  @IsNumber() @Min(1) widthCm: number;
  @IsNumber() @Min(1) heightCm: number;
}

export class RedesignRoomDto {
  @IsString()  roomImageUrl: string;
  @IsNumber() @Min(0) @Max(1) floorLineY: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomItemForDesign)
  items: RoomItemForDesign[];
}
