import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MotivoDescarte } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateMotivoDescarteDto } from './dto/create-motivo-descarte.dto.js';
import type { UpdateMotivoDescarteDto } from './dto/update-motivo-descarte.dto.js';

@Injectable()
export class MotivosDescarteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMotivoDescarteDto): Promise<MotivoDescarte> {
    const existente = await this.prisma.motivoDescarte.findUnique({ where: { nome: dto.nome } });
    if (existente) {
      throw new ConflictException('Já existe um motivo de descarte com este nome.');
    }
    return this.prisma.motivoDescarte.create({ data: dto });
  }

  findAll(): Promise<MotivoDescarte[]> {
    return this.prisma.motivoDescarte.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: string): Promise<MotivoDescarte> {
    const motivo = await this.prisma.motivoDescarte.findUnique({ where: { id } });
    if (!motivo) {
      throw new NotFoundException('Motivo de descarte não encontrado.');
    }
    return motivo;
  }

  async update(id: string, dto: UpdateMotivoDescarteDto): Promise<MotivoDescarte> {
    await this.findOne(id);
    return this.prisma.motivoDescarte.update({ where: { id }, data: dto });
  }
}
