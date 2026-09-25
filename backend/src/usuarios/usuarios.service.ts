import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import type { ResetSenhaDto } from './dto/reset-senha.dto.js';
import type { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import type { UsuarioResponseDto } from './dto/usuario-response.dto.js';

// Nunca inclui senhaHash — só os campos que podem sair pela API.
const usuarioSelect = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  ativo: true,
  locaisAcesso: {
    select: {
      local: { select: { id: true, nome: true } },
    },
  },
} satisfies Prisma.UsuarioSelect;

type UsuarioComLocais = Prisma.UsuarioGetPayload<{ select: typeof usuarioSelect }>;

function paraResponseDto(usuario: UsuarioComLocais): UsuarioResponseDto {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    ativo: usuario.ativo,
    locaisAcesso: usuario.locaisAcesso.map((ul) => ul.local),
  };
}

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto, atorId: string): Promise<UsuarioResponseDto> {
    const emailEmUso = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (emailEmUso) {
      throw new ConflictException('Já existe um usuário com este email.');
    }

    const senhaHash = await argon2.hash(dto.senha);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        papel: dto.papel,
        locaisAcesso: dto.locaisAcesso
          ? { create: dto.locaisAcesso.map((localId) => ({ localId })) }
          : undefined,
      },
      select: usuarioSelect,
    });

    await this.registrarAuditoria(atorId, 'USUARIO_CRIADO', usuario.id, undefined, {
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    });

    return paraResponseDto(usuario);
  }

  async findAll(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.prisma.usuario.findMany({
      select: usuarioSelect,
      orderBy: { nome: 'asc' },
    });
    return usuarios.map(paraResponseDto);
  }

  async findOne(id: string): Promise<UsuarioResponseDto> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id }, select: usuarioSelect });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return paraResponseDto(usuario);
  }

  async update(id: string, dto: UpdateUsuarioDto, atorId: string): Promise<UsuarioResponseDto> {
    const antes = await this.findOne(id);

    const usuario = await this.prisma.$transaction(async (tx) => {
      if (dto.locaisAcesso) {
        await tx.usuarioLocal.deleteMany({ where: { usuarioId: id } });
        await tx.usuarioLocal.createMany({
          data: dto.locaisAcesso.map((localId) => ({ usuarioId: id, localId })),
        });
      }

      return tx.usuario.update({
        where: { id },
        data: {
          nome: dto.nome,
          papel: dto.papel,
          ativo: dto.ativo,
        },
        select: usuarioSelect,
      });
    });

    // Papel, status e locais de acesso são as mudanças que importam pra
    // auditoria — mudar de nome não concede nem tira privilégio nenhum.
    await this.registrarAuditoria(
      atorId,
      'USUARIO_ATUALIZADO',
      id,
      { papel: antes.papel, ativo: antes.ativo, locaisAcesso: antes.locaisAcesso.map((l) => l.id) },
      { papel: usuario.papel, ativo: usuario.ativo, locaisAcesso: usuario.locaisAcesso.map((ul) => ul.local.id) },
    );

    return paraResponseDto(usuario);
  }

  async resetarSenha(id: string, dto: ResetSenhaDto, atorId: string): Promise<UsuarioResponseDto> {
    await this.findOne(id);
    const senhaHash = await argon2.hash(dto.senha);
    const usuario = await this.prisma.usuario.update({
      where: { id },
      data: { senhaHash },
      select: usuarioSelect,
    });
    // Nunca loga a senha — só o fato de que foi redefinida e por quem.
    await this.registrarAuditoria(atorId, 'SENHA_REDEFINIDA', id);
    return paraResponseDto(usuario);
  }

  private async registrarAuditoria(
    atorId: string,
    acao: string,
    entidadeId: string,
    valoresAntes?: object,
    valoresDepois?: object,
  ): Promise<void> {
    await this.prisma.auditoria
      .create({
        data: { usuarioId: atorId, acao, entidade: 'Usuario', entidadeId, valoresAntes, valoresDepois },
      })
      .catch(() => undefined);
  }
}
