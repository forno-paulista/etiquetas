import { PapelUsuario } from '@prisma/client';

// Payload do access token. locaisAcesso vai embarcado por performance (evita
// query a cada request) — o preço é que uma mudança de acesso só reflete no
// próximo login/refresh, aceitável dado o TTL curto do access token.
export interface JwtPayload {
  sub: string;
  papel: PapelUsuario;
  locaisAcesso: string[];
}
