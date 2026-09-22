import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Fornecedor, PapelUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto.js';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto.js';
import { FornecedoresService } from './fornecedores.service.js';

@ApiTags('fornecedores')
@ApiBearerAuth()
@Roles(PapelUsuario.ADMIN)
@Controller('fornecedores')
export class FornecedoresController {
  constructor(private readonly fornecedoresService: FornecedoresService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um fornecedor' })
  create(@Body() dto: CreateFornecedorDto): Promise<Fornecedor> {
    return this.fornecedoresService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os fornecedores' })
  findAll(): Promise<Fornecedor[]> {
    return this.fornecedoresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um fornecedor por id' })
  findOne(@Param('id') id: string): Promise<Fornecedor> {
    return this.fornecedoresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza nome, CNPJ ou status de um fornecedor' })
  update(@Param('id') id: string, @Body() dto: UpdateFornecedorDto): Promise<Fornecedor> {
    return this.fornecedoresService.update(id, dto);
  }
}
