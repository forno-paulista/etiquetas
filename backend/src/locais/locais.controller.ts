import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Local, PapelUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateLocalDto } from './dto/create-local.dto.js';
import { UpdateLocalDto } from './dto/update-local.dto.js';
import { LocaisService } from './locais.service.js';

@ApiTags('locais')
@ApiBearerAuth()
@Roles(PapelUsuario.ADMIN)
@Controller('locais')
export class LocaisController {
  constructor(private readonly locaisService: LocaisService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um local (CD ou loja)' })
  create(@Body() dto: CreateLocalDto): Promise<Local> {
    return this.locaisService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os locais' })
  findAll(): Promise<Local[]> {
    return this.locaisService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um local por id' })
  findOne(@Param('id') id: string): Promise<Local> {
    return this.locaisService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza nome, tipo ou status de um local' })
  update(@Param('id') id: string, @Body() dto: UpdateLocalDto): Promise<Local> {
    return this.locaisService.update(id, dto);
  }
}
