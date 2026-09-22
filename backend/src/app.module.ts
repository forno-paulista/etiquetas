import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AjustesPendentesModule } from './ajustes-pendentes/ajustes-pendentes.module.js';
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
import { TransferenciasModule } from './transferencias/transferencias.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guards globais: toda rota exige autenticação por padrão — endpoints
    // públicos (login, health) precisam marcar @Public() explicitamente.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
