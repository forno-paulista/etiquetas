import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PapelUsuario } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { FindMovimentosQueryDto } from './dto/find-movimentos-query.dto.js';
import { RelatoriosService } from './relatorios.service.js';

// Relatório é visão de gestão (seção 12 do CLAUDE.md: "Operador: sem
// relatórios") — liberado pra Admin/Gestor CD/Gestor Loja, restrito aos
// próprios locais pra quem não é Admin (RelatoriosService cuida disso).
@ApiTags('relatorios')
@ApiBearerAuth()
@Roles(PapelUsuario.ADMIN, PapelUsuario.GESTOR_CD, PapelUsuario.GESTOR_LOJA)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('movimentos')
  @ApiOperation({ summary: 'Relatório de movimentações — dado bruto, filtrável por produto/local/tipo/período' })
  listarMovimentos(@Query() query: FindMovimentosQueryDto, @CurrentUser() usuario: JwtPayload) {
    return this.relatoriosService.listarMovimentos(query, usuario);
  }
}
