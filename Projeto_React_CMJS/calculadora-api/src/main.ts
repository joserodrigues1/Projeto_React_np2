import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './infra/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    // Permite requisições de QUALQUER origem
    origin: '*',

    // Permite TODOS os métodos HTTP (GET, POST, etc.)
    methods: '*',

    // Permite TODOS os cabeçalhos (Headers)
    allowedHeaders: '*',
  });
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
