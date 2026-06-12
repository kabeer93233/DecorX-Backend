import { IsString, IsArray, IsOptional } from 'class-validator';

export class SaveDesignDto {
  @IsString()
  roomId!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  items!: object[];

  @IsOptional()
  cameraState?: object;

  @IsString()
  @IsOptional()
  screenshotUrl?: string;

  @IsString()
  @IsOptional()
  designId?: string;
}
