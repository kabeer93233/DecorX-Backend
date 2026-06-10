import { IsString, IsUrl } from 'class-validator';

export class AnalyzeRoomDto {
  @IsString()
  @IsUrl()
  roomImageUrl!: string;
}
