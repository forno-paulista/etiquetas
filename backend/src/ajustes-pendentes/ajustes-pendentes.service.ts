import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PapelUsuario, StatusAjustePendente, StatusAjusteExterno } from '@prisma/client';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { FindAjustesQueryDto } from './dto/find-ajustes-query.dto.js';

const ajusteComRelacoesInclude = {
  descarte: { include: { lote: { include: { produto: true } }, motivo: true } },
  local: true,
  usuarioQueMarcou: { select: { id: true, nome: true } },
};

@Injectable()
export class AjustesPendentesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filtros: FindAjustesQueryDto) {
    return this.prisma.ajustePendente.findMany({
      where: filtros,
      include: ajusteComRelacoesInclude,
      orderBy: { data: 'asc' },
    });
  }

  async marcarLancado(id: string, usuario: JwtPayload) {
    const ajuste = await this.prisma.ajustePendente.findUnique({ where: { id } });
    if (!ajuste) {
      throw new NotFoundException('Ajuste pendente não encontrado.');
    }
    if (usuario.papel !== PapelUsuario.ADMIN && !usuario.locaisAcesso.includes(ajuste.localId)) {
      throw new ForbiddenException('Usuário não tem acesso a este local.');
    }
    if (ajuste.status === StatusAjustePendente.LANCADO_MANUALMENTE) {
      throw new BadRequestException('Este ajuste já foi marcado como lançado.');
    }

    await this.prisma.$transaction([
      this.prisma.ajustePendente.update({
        where: { id },
        data: {
          status: StatusAjustePendente.LANCADO_MANUALMENTE,
          usuarioQueMarcouId: usuario.sub,
          data: new Date(),
        },
      }),
      this.prisma.descarte.update({
        where: { id: ajuste.descarteId },
        data: { statusAjusteExterno: StatusAjusteExterno.AJUSTADO_EXTERNAMENTE },
      }),
    ]);

    return this.prisma.ajustePendente.findUnique({ where: { id }, include: ajusteComRelacoesInclude });
  }
}
