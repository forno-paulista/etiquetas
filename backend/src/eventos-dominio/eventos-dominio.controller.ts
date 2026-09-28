import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PapelUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { FindEventosQueryDto } from './dto/find-eventos-query.dto.js';
import { EventosDominioService } from './eventos-dominio.service.js';

// Ponto de extensão pra integrações futuras (seção 8 do CLAUDE.md):
// um adaptador externo consome lendo esta lista com `desde=<último id
// processado>`, sem o núcleo saber que ele existe. Restrito a Admin por
// enquanto — o dia que um adaptador real existir (StockProvider etc.),
// ele provavelmente vai autenticar com credencial própria, não um login
// de usuário; decidir isso quando existir um consumidor de verdade.
@ApiTags('eventos-dominio')
@ApiBearerAuth()
@Roles(PapelUsuario.ADMIN)
@Controller('eventos')
export class EventosDominioController {
  constructor(private readonly eventosDominioService: EventosDominioService) {}

  @Get()
  @ApiOperation({
    summary: 'Log de eventos de domínio — polling por cursor (?desde=<id>) pra adaptadores externos',
  })
  listar(@Query() query: FindEventosQueryDto) {
    return this.eventosDominioService.listar(query);
  }
}
