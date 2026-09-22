import { Module } from '@nestjs/common';
import { TransferenciasController } from './transferencias.controller.js';
import { TransferenciasService } from './transferencias.service.js';

@Module({
  controllers: [TransferenciasController],
  providers: [TransferenciasService],
  exports: [TransferenciasService],
})
export class TransferenciasModule {}
