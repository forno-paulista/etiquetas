import { Module } from '@nestjs/common';
import { DescarteController } from './descarte.controller.js';
import { DescarteService } from './descarte.service.js';

@Module({
  controllers: [DescarteController],
  providers: [DescarteService],
})
export class DescarteModule {}
