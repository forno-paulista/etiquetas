import { Module } from '@nestjs/common';
import { MotivosDescarteController } from './motivos-descarte.controller.js';
import { MotivosDescarteService } from './motivos-descarte.service.js';

@Module({
  controllers: [MotivosDescarteController],
  providers: [MotivosDescarteService],
  exports: [MotivosDescarteService],
})
export class MotivosDescarteModule {}
