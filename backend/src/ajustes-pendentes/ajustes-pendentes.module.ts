import { Module } from '@nestjs/common';
import { AjustesPendentesController } from './ajustes-pendentes.controller.js';
import { AjustesPendentesService } from './ajustes-pendentes.service.js';

@Module({
  controllers: [AjustesPendentesController],
  providers: [AjustesPendentesService],
})
export class AjustesPendentesModule {}
