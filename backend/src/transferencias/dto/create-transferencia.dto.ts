import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NaturezaTransferencia } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateTransferenciaDto {
  @ApiProperty()
  @IsString()
  loteId!: string;

  @ApiProperty({ description: 'De onde está saindo (precisa ser um local que o usuário tem acesso)' })
  @IsString()
  localOrigemId!: string;

  @ApiProperty()
  @IsString()
  localDestinoId!: string;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidade!: number;

  @ApiPropertyOptional({ enum: NaturezaTransferencia, default: NaturezaTransferencia.INTERNA })
  @IsOptional()
  @IsEnum(NaturezaTransferencia)
  natureza?: NaturezaTransferencia;
}
