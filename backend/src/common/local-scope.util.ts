import { ForbiddenException } from '@nestjs/common';
import { PapelUsuario } from '@prisma/client';
import type { JwtPayload } from '../auth/jwt-payload.js';

// LocalAccessGuard só protege as rotas de escrita (regra 12 do CLAUDE.md
// exige acesso por local também na leitura). Usado pelos GET/list de
// lotes, descartes, ajustes-pendentes: se o usuário pedir um localId fora
// do próprio acesso, nega; se não pedir nenhum, restringe aos locais dele
// em vez de devolver tudo. Admin nunca é restringido.
//
// undefined = sem restrição nenhuma (admin sem filtro); array = restringe
// a esses ids (usar em `localId: { in: resultado } }`).
export function localIdsPermitidos(usuario: JwtPayload, localIdFiltro?: string): string[] | undefined {
  if (usuario.papel === PapelUsuario.ADMIN) {
    return localIdFiltro ? [localIdFiltro] : undefined;
  }
  if (localIdFiltro) {
    if (!usuario.locaisAcesso.includes(localIdFiltro)) {
      throw new ForbiddenException('Usuário não tem acesso a este local.');
    }
    return [localIdFiltro];
  }
  return usuario.locaisAcesso;
}
