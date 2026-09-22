import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Grupo, PapelUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateGrupoDto } from './dto/create-grupo.dto.js';
import { UpdateGrupoDto } from './dto/update-grupo.dto.js';
import { GruposService } from './grupos.service.js';

@ApiTags('grupos')
@ApiBearerAuth()
@Roles(PapelUsuario.ADMIN)
@Controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um grupo ou subgrupo de produto' })
  create(@Body() dto: CreateGrupoDto): Promise<Grupo> {
    return this.gruposService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os grupos' })
  findAll(): Promise<Grupo[]> {
    return this.gruposService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um grupo por id' })
  findOne(@Param('id') id: string): Promise<Grupo> {
    return this.gruposService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza nome, ícone ou status de um grupo' })
  update(@Param('id') id: string, @Body() dto: UpdateGrupoDto): Promise<Grupo> {
    return this.gruposService.update(id, dto);
  }
}
