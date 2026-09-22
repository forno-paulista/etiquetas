import { createHash, randomBytes } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Usuario } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from './jwt-payload.js';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, senha: string): Promise<Tokens> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: { locaisAcesso: true },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const senhaValida = await argon2.verify(usuario.senhaHash, senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const locaisAcesso = usuario.locaisAcesso.map((ul) => ul.localId);
    return this.emitirTokens(usuario, locaisAcesso);
  }

  async refresh(refreshTokenPlano: string): Promise<Tokens> {
    const tokenHash = this.hashToken(refreshTokenPlano);
    const registro = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { usuario: { include: { locaisAcesso: true } } },
    });

    if (!registro || registro.revokedAt || registro.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    // Rotação: todo uso do refresh token o revoga e emite um par novo.
    await this.prisma.refreshToken.update({
      where: { id: registro.id },
      data: { revokedAt: new Date() },
    });

    if (!registro.usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo.');
    }

    const locaisAcesso = registro.usuario.locaisAcesso.map((ul) => ul.localId);
    return this.emitirTokens(registro.usuario, locaisAcesso);
  }

  async logout(refreshTokenPlano: string): Promise<void> {
    const tokenHash = this.hashToken(refreshTokenPlano);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async emitirTokens(usuario: Usuario, locaisAcesso: string[]): Promise<Tokens> {
    const payload: JwtPayload = { sub: usuario.id, papel: usuario.papel, locaisAcesso };

    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: Math.floor(this.parseDuracaoMs(accessExpiresIn) / 1000),
    });

    const refreshTokenPlano = randomBytes(48).toString('hex');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    await this.prisma.refreshToken.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: this.hashToken(refreshTokenPlano),
        expiresAt: new Date(Date.now() + this.parseDuracaoMs(refreshExpiresIn)),
      },
    });

    return { accessToken, refreshToken: refreshTokenPlano };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // Suporta os formatos simples que @nestjs/jwt aceita como `expiresIn`
  // (ex.: "15m", "7d", "3600s") — evita puxar uma lib só pra isso.
  private parseDuracaoMs(duracao: string): number {
    const match = /^(\d+)([smhd])$/.exec(duracao);
    if (!match) {
      throw new Error(`Formato de duração inválido: ${duracao}`);
    }
    const valor = Number(match[1]);
    const unidadeMs: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    return valor * unidadeMs[match[2]!]!;
  }
}
