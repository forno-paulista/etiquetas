import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PapelUsuario, Produto } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';
import { ProdutosService } from './produtos.service.js';

@ApiTags('produtos')
@ApiBearerAuth()
@Roles(PapelUsuario.ADMIN)
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um produto' })
  create(@Body() dto: CreateProdutoDto): Promise<Produto> {
    return this.produtosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os produtos' })
  findAll(): Promise<Produto[]> {
    return this.produtosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um produto por id' })
  findOne(@Param('id') id: string): Promise<Produto> {
    return this.produtosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza nome, unidade, grupo ou status de um produto' })
  update(@Param('id') id: string, @Body() dto: UpdateProdutoDto): Promise<Produto> {
    return this.produtosService.update(id, dto);
  }
}
