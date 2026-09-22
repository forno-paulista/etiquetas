import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateLoteDto {
  @ApiProperty()
  @IsString()
  produtoId!: string;

  @ApiProperty({ description: 'Local onde o recebimento está acontecendo' })
  @IsString()
  localId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fornecedorId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  codigoLote!: string;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidade!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  dataFabricacao?: string;

  @ApiProperty()
  @IsISO8601()
  dataValidade!: string;
}
