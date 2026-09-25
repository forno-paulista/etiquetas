import { BadRequestException } from '@nestjs/common';

// Regra 10 (CLAUDE.md § 5): validade continua editável manualmente — se
// informada, ela sempre vence o padrão. Se omitida, cai pro
// `validadePadraoDias` do produto (ex.: queijo = 7 dias), contado a partir
// de `dataBase` (recebimento/fabricação). Sem os dois, não tem como seguir.
export function resolverDataValidade(
  dataValidadeInformada: string | undefined,
  dataBase: Date,
  validadePadraoDias: number | null | undefined,
): Date {
  if (dataValidadeInformada) {
    return new Date(dataValidadeInformada);
  }
  if (validadePadraoDias) {
    const resultado = new Date(dataBase);
    resultado.setDate(resultado.getDate() + validadePadraoDias);
    return resultado;
  }
  throw new BadRequestException(
    'Informe dataValidade — este produto não tem validadePadraoDias configurada.',
  );
}
