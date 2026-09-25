import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindMovimentosQueryDto } from './dto/find-movimentos-query.dto.js';
import { RelatoriosService } from './relatorios.service.js';

// Leitura liberada pra qualquer usuário autenticado — mesmo critério dos
// cadastros (seção 12 do CLAUDE.md): consultar histórico não é uma ação
// administrativa.
@ApiTags('relatorios')
@ApiBearerAuth()
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('movimentos')
  @ApiOperation({ summary: 'Relatório de movimentações — dado bruto, filtrável por produto/local/tipo/período' })
  listarMovimentos(@Query() query: FindMovimentosQueryDto) {
    return this.relatoriosService.listarMovimentos(query);
  }
}
