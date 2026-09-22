import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { LocalAccessGuard } from '../auth/guards/local-access.guard.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { DescarteService } from './descarte.service.js';
import { CreateDescarteDto } from './dto/create-descarte.dto.js';
import { FindDescartesQueryDto } from './dto/find-descartes-query.dto.js';

@ApiTags('descarte')
@ApiBearerAuth()
@Controller('descartes')
export class DescarteController {
  constructor(private readonly descarteService: DescarteService) {}

  @Post()
  @UseGuards(LocalAccessGuard)
  @ApiOperation({ summary: 'Registra um descarte (lote, quantidade, motivo, local)' })
  registrar(@Body() dto: CreateDescarteDto, @CurrentUser() usuario: JwtPayload) {
    return this.descarteService.registrar(dto, usuario.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lista descartes, com filtros por local/motivo' })
  findAll(@Query() query: FindDescartesQueryDto) {
    return this.descarteService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta um descarte' })
  findOne(@Param('id') id: string) {
    return this.descarteService.findOne(id);
  }
}
