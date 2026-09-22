import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ConsumoInputDto } from './consumo-input.dto.js';

export class CreateProducaoDto {
  @ApiProperty()
  @IsString()
  produtoSaidaId!: string;

  @ApiProperty({ description: 'Local onde a produção está acontecendo (CD ou loja)' })
  @IsString()
  localId!: string;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidadeProduzida!: number;

  @ApiProperty({ description: 'Definida manualmente — o sistema não calcula automaticamente (regra 10)' })
  @IsISO8601()
  validadeSaida!: string;

  @ApiPropertyOptional({ description: 'Se omitido, usa a data de hoje (AAAA-MM-DD)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  codigoLote?: string;

  @ApiProperty({ type: [ConsumoInputDto], description: '1 ou mais lotes de origem consumidos' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ConsumoInputDto)
  consumos!: ConsumoInputDto[];
}
