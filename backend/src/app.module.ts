import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AjustesPendentesModule } from './ajustes-pendentes/ajustes-pendentes.module.js';
import { AlertasValidadeModule } from './alertas-validade/alertas-validade.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './auth/guards/roles.guard.js';
import { ConsumoModule } from './consumo/consumo.module.js';
import { ContagemModule } from './contagem/contagem.module.js';
import { DescarteModule } from './descarte/descarte.module.js';
import { FornecedoresModule } from './fornecedores/fornecedores.module.js';
import { GruposModule } from './grupos/grupos.module.js';
import { LocaisModule } from './locais/locais.module.js';
import { LotesModule } from './lotes/lotes.module.js';
import { MotivosDescarteModule } from './motivos-descarte/motivos-descarte.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProducaoModule } from './producao/producao.module.js';
import { ProdutosModule } from './produtos/produtos.module.js';
import { RelatoriosModule } from './relatorios/relatorios.module.js';
import { TransferenciasModule } from './transferencias/transferencias.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Limite geral generoso (protege a API como um todo); o endpoint
    // público de QR (seção 15/13 do CLAUDE.md) usa um limite bem mais
    // apertado via @Throttle() na própria rota.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 300 }]),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    LocaisModule,
    GruposModule,
    FornecedoresModule,
    MotivosDescarteModule,
    ProdutosModule,
    LotesModule,
    ProducaoModule,
    TransferenciasModule,
    ConsumoModule,
    DescarteModule,
    AjustesPendentesModule,
    ContagemModule,
    AlertasValidadeModule,
    RelatoriosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guards globais: toda rota exige autenticação por padrão — endpoints
    // públicos (login, health) precisam marcar @Public() explicitamente.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
