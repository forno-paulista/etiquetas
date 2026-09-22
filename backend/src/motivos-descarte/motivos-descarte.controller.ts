import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MotivoDescarte, PapelUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateMotivoDescarteDto } from './dto/create-motivo-descarte.dto.js';
import { UpdateMotivoDescarteDto } from './dto/update-motivo-descarte.dto.js';
import { MotivosDescarteService } from './motivos-descarte.service.js';

// Leitura liberada pra qualquer usuário autenticado — ver locais.controller.ts.
@ApiTags('motivos-descarte')
@ApiBearerAuth()
@Controller('motivos-descarte')
export class MotivosDescarteController {
  constructor(private readonly motivosDescarteService: MotivosDescarteService) {}

  @Post()
  @Roles(PapelUsuario.ADMIN)
  @ApiOperation({ summary: 'Cria um motivo de descarte' })
  create(@Body() dto: CreateMotivoDescarteDto): Promise<MotivoDescarte> {
    return this.motivosDescarteService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os motivos de descarte' })
  findAll(): Promise<MotivoDescarte[]> {
    return this.motivosDescarteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um motivo de descarte por id' })
  findOne(@Param('id') id: string): Promise<MotivoDescarte> {
    return this.motivosDescarteService.findOne(id);
  }

  @Patch(':id')
  @Roles(PapelUsuario.ADMIN)
  @ApiOperation({ summary: 'Atualiza nome ou status de um motivo de descarte' })
  update(@Param('id') id: string, @Body() dto: UpdateMotivoDescarteDto): Promise<MotivoDescarte> {
    return this.motivosDescarteService.update(id, dto);
  }
}
