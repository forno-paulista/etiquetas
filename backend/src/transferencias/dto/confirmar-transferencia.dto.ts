import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class ConfirmarTransferenciaDto {
  @ApiProperty({ description: 'Quantidade realmente contada na chegada — pode divergir da enviada' })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidadeConfirmada!: number;
}
