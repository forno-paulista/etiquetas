import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindDescartesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motivoId?: string;
}
