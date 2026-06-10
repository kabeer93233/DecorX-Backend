import { IsString, IsUrl, IsOptional, IsObject } from 'class-validator';

export class SaveAiDesignDto {
  @IsString()
  productId!: string;

  @IsString()
  productName!: string;

  @IsString()
  @IsUrl()
  roomImageUrl!: string;

  @IsString()
  @IsUrl()
  resultImageUrl!: string;

  @IsOptional()
  @IsObject()
  roomAnalysis?: object;

  @IsOptional()
  @IsObject()
  placement?: object;
}
