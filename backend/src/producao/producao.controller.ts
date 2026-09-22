import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { LocalAccessGuard } from '../auth/guards/local-access.guard.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { CreateProducaoDto } from './dto/create-producao.dto.js';
import { ProducaoService } from './producao.service.js';

@ApiTags('producao')
@ApiBearerAuth()
@Controller('producao')
export class ProducaoController {
  constructor(private readonly producaoService: ProducaoService) {}

  @Post()
  @UseGuards(LocalAccessGuard)
  @ApiOperation({ summary: 'Registra uma produção/porcionamento: consome lote(s) de origem, gera um lote novo' })
  criar(@Body() dto: CreateProducaoDto, @CurrentUser() usuario: JwtPayload) {
    return this.producaoService.criar(dto, usuario.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta uma produção, com a genealogia dos lotes de origem' })
  findOne(@Param('id') id: string) {
    return this.producaoService.findOne(id);
  }
}
