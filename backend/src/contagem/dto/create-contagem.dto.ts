import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateContagemDto {
  @ApiProperty()
  @IsString()
  loteId!: string;

  @ApiProperty()
  @IsString()
  localId!: string;

  @ApiProperty({ description: 'Quantidade contada fisicamente agora' })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  quantidadeContada!: number;

  @ApiPropertyOptional({
    description: 'Obrigatório se a contagem divergir do saldo do sistema (checado no service, não aqui — depende do saldo atual)',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  observacao?: string;
}
