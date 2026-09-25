import { Module } from '@nestjs/common';
import { AlertasValidadeController } from './alertas-validade.controller.js';
import { AlertasValidadeService } from './alertas-validade.service.js';

@Module({
  controllers: [AlertasValidadeController],
  providers: [AlertasValidadeService],
})
export class AlertasValidadeModule {}
