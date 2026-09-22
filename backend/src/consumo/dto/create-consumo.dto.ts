import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateConsumoDto {
  @ApiProperty()
  @IsString()
  loteId!: string;

  @ApiProperty({ description: 'Local onde o consumo aconteceu' })
  @IsString()
  localId!: string;

  @ApiProperty({ description: 'Quantidade total usada — pode ser lançada em lote, não precisa ser em tempo real (regra 14)' })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidade!: number;
}
