import { Module } from '@nestjs/common';
import { LocaisController } from './locais.controller.js';
import { LocaisService } from './locais.service.js';

@Module({
  controllers: [LocaisController],
  providers: [LocaisService],
  exports: [LocaisService],
})
export class LocaisModule {}
