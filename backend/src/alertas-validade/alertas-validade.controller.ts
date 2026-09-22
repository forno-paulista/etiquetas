import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlertasValidadeService } from './alertas-validade.service.js';
import { FindAlertasQueryDto } from './dto/find-alertas-query.dto.js';

@ApiTags('alertas-validade')
@ApiBearerAuth()
@Controller('alertas-validade')
export class AlertasValidadeController {
  constructor(private readonly alertasValidadeService: AlertasValidadeService) {}

  @Get()
  @ApiOperation({
    summary: 'Painel de validade: lotes vencidos, vencendo hoje, amanhã e nos próximos N dias (seção 4/11)',
  })
  listar(@Query() query: FindAlertasQueryDto) {
    return this.alertasValidadeService.listar(query);
  }
}
