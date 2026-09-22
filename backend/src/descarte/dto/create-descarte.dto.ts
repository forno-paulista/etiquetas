import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateDescarteDto {
  @ApiProperty()
  @IsString()
  loteId!: string;

  @ApiProperty()
  @IsString()
  localId!: string;

  @ApiProperty()
  @IsString()
  motivoId!: string;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidade!: number;
}
