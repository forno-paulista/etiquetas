import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { LocalAccessGuard } from '../auth/guards/local-access.guard.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ContagemService } from './contagem.service.js';
import { CreateContagemDto } from './dto/create-contagem.dto.js';

@ApiTags('contagem')
@ApiBearerAuth()
@Controller('contagem')
export class ContagemController {
  constructor(private readonly contagemService: ContagemService) {}

  @Post()
  @UseGuards(LocalAccessGuard)
  @ApiOperation({ summary: 'Registra uma contagem física — só gera ajuste se divergir do saldo do sistema' })
  registrar(@Body() dto: CreateContagemDto, @CurrentUser() usuario: JwtPayload) {
    return this.contagemService.registrar(dto, usuario.sub);
  }
}
