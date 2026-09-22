import { Module } from '@nestjs/common';
import { ContagemController } from './contagem.controller.js';
import { ContagemService } from './contagem.service.js';

@Module({
  controllers: [ContagemController],
  providers: [ContagemService],
})
export class ContagemModule {}
