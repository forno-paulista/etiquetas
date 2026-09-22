import { Module } from '@nestjs/common';
import { ProducaoController } from './producao.controller.js';
import { ProducaoService } from './producao.service.js';

@Module({
  controllers: [ProducaoController],
  providers: [ProducaoService],
  exports: [ProducaoService],
})
export class ProducaoModule {}
