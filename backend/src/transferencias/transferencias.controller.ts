import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { LocalAccessGuard } from '../auth/guards/local-access.guard.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ConfirmarTransferenciaDto } from './dto/confirmar-transferencia.dto.js';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto.js';
import { FindTransferenciasQueryDto } from './dto/find-transferencias-query.dto.js';
import { TransferenciasService } from './transferencias.service.js';

@ApiTags('transferencias')
@ApiBearerAuth()
@Controller('transferencias')
export class TransferenciasController {
  constructor(private readonly transferenciasService: TransferenciasService) {}

  @Post()
  @UseGuards(LocalAccessGuard)
  @ApiOperation({ summary: 'Envia um lote de um local para outro (fica EM_TRANSITO até ser confirmado)' })
  enviar(@Body() dto: CreateTransferenciaDto, @CurrentUser() usuario: JwtPayload) {
    return this.transferenciasService.enviar(dto, usuario.sub);
  }

  @Patch(':id/confirmar')
  @ApiOperation({ summary: 'Confirma o recebimento (quantidade pode divergir da enviada)' })
  confirmar(
    @Param('id') id: string,
    @Body() dto: ConfirmarTransferenciaDto,
    @CurrentUser() usuario: JwtPayload,
  ) {
    return this.transferenciasService.confirmar(id, dto, usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Lista transferências, com filtros por status/local' })
  findAll(@Query() query: FindTransferenciasQueryDto) {
    return this.transferenciasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta uma transferência' })
  findOne(@Param('id') id: string) {
    return this.transferenciasService.findOne(id);
  }
}
