import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AjustesPendentesService } from './ajustes-pendentes.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { FindAjustesQueryDto } from './dto/find-ajustes-query.dto.js';

@ApiTags('ajustes-pendentes')
@ApiBearerAuth()
@Controller('ajustes-pendentes')
export class AjustesPendentesController {
  constructor(private readonly ajustesPendentesService: AjustesPendentesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista a fila de ajustes pendentes (descartes em loja que precisam ser lançados manualmente no Saipos)' })
  findAll(@Query() query: FindAjustesQueryDto) {
    return this.ajustesPendentesService.findAll(query);
  }

  @Patch(':id/marcar-lancado')
  @ApiOperation({ summary: 'Marca que o ajuste já foi lançado manualmente no Saipos' })
  marcarLancado(@Param('id') id: string, @CurrentUser() usuario: JwtPayload) {
    return this.ajustesPendentesService.marcarLancado(id, usuario);
  }
}
