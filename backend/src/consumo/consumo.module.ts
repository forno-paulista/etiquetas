import { Module } from '@nestjs/common';
import { ConsumoController } from './consumo.controller.js';
import { ConsumoService } from './consumo.service.js';

@Module({
  controllers: [ConsumoController],
  providers: [ConsumoService],
})
export class ConsumoModule {}
