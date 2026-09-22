import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { LocalAccessGuard } from '../auth/guards/local-access.guard.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { CreateLoteDto } from './dto/create-lote.dto.js';
import { LotePublicoResponseDto } from './dto/lote-publico-response.dto.js';
import { LotesService } from './lotes.service.js';

@ApiTags('lotes')
@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(LocalAccessGuard)
  @ApiOperation({ summary: 'Recebimento: cria um lote, gera o QR Code e registra a entrada' })
  receber(@Body() dto: CreateLoteDto, @CurrentUser() usuario: JwtPayload) {
    return this.lotesService.receber(dto, usuario.sub);
  }

  @Public()
  @Get('qr/:qrCodeId')
  @ApiOperation({ summary: 'Consulta pública de um lote pelo QR Code (sem login, dados básicos só)' })
  consultarPorQrCode(@Param('qrCodeId') qrCodeId: string): Promise<LotePublicoResponseDto> {
    return this.lotesService.findByQrCodePublico(qrCodeId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consulta completa de um lote (histórico de movimentos)' })
  findOne(@Param('id') id: string) {
    return this.lotesService.findOne(id);
  }
}
