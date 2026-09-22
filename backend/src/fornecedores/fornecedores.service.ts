import { Injectable, NotFoundException } from '@nestjs/common';
import { Fornecedor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateFornecedorDto } from './dto/create-fornecedor.dto.js';
import type { UpdateFornecedorDto } from './dto/update-fornecedor.dto.js';

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateFornecedorDto): Promise<Fornecedor> {
    return this.prisma.fornecedor.create({ data: dto });
  }

  findAll(): Promise<Fornecedor[]> {
    return this.prisma.fornecedor.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: string): Promise<Fornecedor> {
    const fornecedor = await this.prisma.fornecedor.findUnique({ where: { id } });
    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado.');
    }
    return fornecedor;
  }

  async update(id: string, dto: UpdateFornecedorDto): Promise<Fornecedor> {
    await this.findOne(id);
    return this.prisma.fornecedor.update({ where: { id }, data: dto });
  }
}
