import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { LocalAccessGuard } from '../auth/guards/local-access.guard.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ConsumoService } from './consumo.service.js';
import { CreateConsumoDto } from './dto/create-consumo.dto.js';

@ApiTags('consumo')
@ApiBearerAuth()
@Controller('consumo')
export class ConsumoController {
  constructor(private readonly consumoService: ConsumoService) {}

  @Post()
  @UseGuards(LocalAccessGuard)
  @ApiOperation({ summary: 'Registra consumo/baixa de um lote (regra 14 — não é perda, sem motivo)' })
  registrar(@Body() dto: CreateConsumoDto, @CurrentUser() usuario: JwtPayload) {
    return this.consumoService.registrar(dto, usuario.sub);
  }
}
