import { Injectable, NotFoundException } from '@nestjs/common';
import { Produto } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateProdutoDto } from './dto/create-produto.dto.js';
import type { UpdateProdutoDto } from './dto/update-produto.dto.js';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProdutoDto): Promise<Produto> {
    if (dto.grupoId) {
      await this.validarGrupo(dto.grupoId);
    }
    return this.prisma.produto.create({
      data: {
        nome: dto.nome,
        unidadeMedida: dto.unidadeMedida,
        grupoId: dto.grupoId,
        validadePadraoDias: dto.validadePadraoDias,
      },
    });
  }

  findAll(): Promise<Produto[]> {
    return this.prisma.produto.findMany({ orderBy: { nome: 'asc' }, include: { grupo: true } });
  }

  async findOne(id: string): Promise<Produto> {
    const produto = await this.prisma.produto.findUnique({ where: { id }, include: { grupo: true } });
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return produto;
  }

  async update(id: string, dto: UpdateProdutoDto): Promise<Produto> {
    await this.findOne(id);
    if (dto.grupoId) {
      await this.validarGrupo(dto.grupoId);
    }
    return this.prisma.produto.update({ where: { id }, data: dto });
  }

  private async validarGrupo(grupoId: string): Promise<void> {
    const grupo = await this.prisma.grupo.findUnique({ where: { id: grupoId } });
    if (!grupo) {
      throw new NotFoundException('Grupo não encontrado.');
    }
  }
}
