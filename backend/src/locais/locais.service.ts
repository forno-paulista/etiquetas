import { Injectable, NotFoundException } from '@nestjs/common';
import { Local } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateLocalDto } from './dto/create-local.dto.js';
import type { UpdateLocalDto } from './dto/update-local.dto.js';

@Injectable()
export class LocaisService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLocalDto): Promise<Local> {
    // Sistema não é multi-organização — sempre a primeira (única)
    // Organizacao existente, criada pelo seed.
    const organizacao = await this.prisma.organizacao.findFirstOrThrow();
    return this.prisma.local.create({
      data: { nome: dto.nome, tipo: dto.tipo, organizacaoId: organizacao.id },
    });
  }

  findAll(): Promise<Local[]> {
    return this.prisma.local.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: string): Promise<Local> {
    const local = await this.prisma.local.findUnique({ where: { id } });
    if (!local) {
      throw new NotFoundException('Local não encontrado.');
    }
    return local;
  }

  async update(id: string, dto: UpdateLocalDto): Promise<Local> {
    await this.findOne(id);
    return this.prisma.local.update({ where: { id }, data: dto });
  }
}
