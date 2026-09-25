import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { LocalAccessGuard } from '../auth/guards/local-access.guard.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { CreateLoteDto } from './dto/create-lote.dto.js';
import { FindLotesQueryDto } from './dto/find-lotes-query.dto.js';
import { LoteResumoResponseDto } from './dto/lote-resumo-response.dto.js';
import { LotesService } from './lotes.service.js';

@ApiTags('lotes')
@ApiBearerAuth()
@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @UseGuards(LocalAccessGuard)
  @ApiOperation({ summary: 'Recebimento: cria um lote, gera o QR Code e registra a entrada' })
  receber(@Body() dto: CreateLoteDto, @CurrentUser() usuario: JwtPayload) {
    return this.lotesService.receber(dto, usuario.sub);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista lotes com saldo, pra escolher em Transferência/Produção/Descarte/Consumo (ordenado por validade — FEFO)',
  })
  findAll(@Query() query: FindLotesQueryDto) {
    return this.lotesService.findAll(query);
  }

  @Get('qr/:qrCodeId')
  @ApiOperation({ summary: 'Consulta resumida de um lote pelo QR Code (autenticado — uso interno, não público)' })
  consultarPorQrCode(@Param('qrCodeId') qrCodeId: string): Promise<LoteResumoResponseDto> {
    return this.lotesService.findByQrCode(qrCodeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta completa de um lote (histórico de movimentos)' })
  findOne(@Param('id') id: string) {
    return this.lotesService.findOne(id);
  }
}
