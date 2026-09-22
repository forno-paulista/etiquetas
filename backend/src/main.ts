import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentação OpenAPI. Não expor em produção: descreve toda a
  // superfície da API, incluindo endpoints administrativos.
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Rastreabilidade de Produtos/Insumos')
      .setDescription(
        'API de rastreabilidade de lotes (produto → lote → quantidade → validade → localização → QR Code) ' +
          'para a rede de pizzarias. Complementar ao Saipos (lojas) e Varejo Fácil (CD) — ver CLAUDE.md na raiz do repo.',
      )
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
