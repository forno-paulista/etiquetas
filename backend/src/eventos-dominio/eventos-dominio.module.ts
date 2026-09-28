import { Global, Module } from '@nestjs/common';
import { EventosDominioController } from './eventos-dominio.controller.js';
import { EventosDominioService } from './eventos-dominio.service.js';

// @Global: todo module de domínio (lotes, descarte, producao...) precisa
// gravar evento — deixar cada um importar EventosDominioModule só repetiria
// isso 6 vezes sem ganhar nada (mesmo padrão do PrismaModule).
@Global()
@Module({
  controllers: [EventosDominioController],
  providers: [EventosDominioService],
  exports: [EventosDominioService],
})
export class EventosDominioModule {}
