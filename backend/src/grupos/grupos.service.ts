import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Grupo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateGrupoDto } from './dto/create-grupo.dto.js';
import type { UpdateGrupoDto } from './dto/update-grupo.dto.js';

@Injectable()
export class GruposService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGrupoDto): Promise<Grupo> {
    if (dto.grupoPaiId) {
      const grupoPai = await this.prisma.grupo.findUnique({ where: { id: dto.grupoPaiId } });
      if (!grupoPai) {
        throw new NotFoundException('Grupo pai não encontrado.');
      }
      // Hierarquia de no máximo 2 níveis (grupo → subgrupo, ver schema.prisma).
      if (grupoPai.grupoPaiId) {
        throw new BadRequestException('Um subgrupo não pode ter outro subgrupo — máximo de 2 níveis.');
      }
    }

    return this.prisma.grupo.create({
      data: { nome: dto.nome, icone: dto.icone, grupoPaiId: dto.grupoPaiId },
    });
  }

  findAll(): Promise<Grupo[]> {
    return this.prisma.grupo.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: string): Promise<Grupo> {
    const grupo = await this.prisma.grupo.findUnique({ where: { id } });
    if (!grupo) {
      throw new NotFoundException('Grupo não encontrado.');
    }
    return grupo;
  }

  async update(id: string, dto: UpdateGrupoDto): Promise<Grupo> {
    await this.findOne(id);
    return this.prisma.grupo.update({ where: { id }, data: dto });
  }
}
