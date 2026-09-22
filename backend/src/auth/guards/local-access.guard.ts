import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PapelUsuario } from '@prisma/client';
import type { JwtPayload } from '../jwt-payload.js';

// Aplicado por rota (não global) em endpoints que operam sobre um Local
// específico (Recebimento, Transferência, Descarte, Produção...). Procura,
// nessa ordem, `localId`, `localOrigemId`, `localDestinoId` em params, body
// ou query — o primeiro que existir é o que se valida. Isso cobre tanto
// endpoints com um único local (Recebimento) quanto os de Transferência,
// onde só o campo relevante pra aquela ação específica (enviar → origem,
// confirmar → destino) aparece no corpo da requisição. Admin tem acesso a
// todos os locais (seção 12 do CLAUDE.md), então nunca é bloqueado.
@Injectable()
export class LocalAccessGuard implements CanActivate {
  private static readonly CAMPOS = ['localId', 'localOrigemId', 'localDestinoId'] as const;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const usuario = request.user as JwtPayload;

    if (usuario.papel === PapelUsuario.ADMIN) {
      return true;
    }

    const fontes = [request.params, request.body, request.query];
    let localId: string | undefined;
    for (const campo of LocalAccessGuard.CAMPOS) {
      localId = fontes.find((fonte) => fonte?.[campo])?.[campo];
      if (localId) break;
    }

    if (!localId) {
      return true;
    }

    if (!usuario.locaisAcesso.includes(localId)) {
      throw new ForbiddenException('Usuário não tem acesso a este local.');
    }

    return true;
  }
}
